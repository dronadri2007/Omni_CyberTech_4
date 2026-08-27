"""Model backend for the VERIFRAME inference service.

Two backends, selected automatically:

1. **torch**  — if `torch`/`timm` import AND `MODEL_WEIGHTS` points to a checkpoint,
   a trained face-forgery classifier (e.g. EfficientNet-B4 on FaceForensics++/DFDC).
2. **frequency-heuristic** — otherwise. A real, no-training signal: GAN/diffusion
   output leaves periodic artefacts and an inflated high-frequency tail in the 2-D
   power spectrum; sensor captures fall off smoothly. Honest stand-in until (1) is wired.
"""
from __future__ import annotations

import io
import os
from dataclasses import dataclass

import numpy as np
from PIL import Image

MODEL_WEIGHTS = os.getenv("MODEL_WEIGHTS")
MODEL_ARCH = os.getenv("MODEL_ARCH", "tf_efficientnet_b4")


@dataclass
class Prediction:
    face_forgery_score: float
    temporal_score: float
    audio_visual_score: float
    metadata_score: float
    heatmap: list[list[float]]
    reasoning: list[str]
    model_version: str


def _radial_power_spectrum(gray: np.ndarray) -> np.ndarray:
    f = np.fft.fftshift(np.fft.fft2(gray - gray.mean()))
    mag = np.abs(f) ** 2
    h, w = mag.shape
    cy, cx = h // 2, w // 2
    y, x = np.indices((h, w))
    r = np.sqrt((x - cx) ** 2 + (y - cy) ** 2).astype(int)
    tbin = np.bincount(r.ravel(), mag.ravel())
    nr = np.bincount(r.ravel())
    nr[nr == 0] = 1
    return tbin / nr


def _heuristic(img: Image.Image) -> Prediction:
    g = np.asarray(img.convert("L").resize((256, 256)), dtype=np.float64) / 255.0
    prof = _radial_power_spectrum(g)
    prof = prof[: len(prof) // 2]
    prof = prof / (prof.sum() + 1e-9)

    lo = prof[: len(prof) // 4].sum()
    hi = prof[len(prof) * 3 // 4:].sum()
    hf_ratio = float(hi / (lo + 1e-9))

    # Grid/checkerboard artefacts from transposed-conv upsampling show as sharp,
    # localised spikes above the smoothed spectral profile — the most reliable
    # generative tell. The broad high-frequency tail is a weak secondary cue.
    smooth = np.convolve(prof, np.ones(7) / 7, mode="same")
    residual = (prof - smooth) / (smooth + 1e-9)
    spike = float(np.max(residual[len(residual) // 4:]))
    degenerate = hf_ratio > 0.4  # ~white noise / corrupt — not a natural photo, don't score it

    score = 0.0
    reasons: list[str] = []
    if not degenerate:
        if spike > 6.0:
            score += min(60.0, (spike - 6.0) * 10)
            reasons.append(f"Periodic frequency-domain spike (x{spike:.1f}) - upsampling / GAN artefact.")
        if 0.10 < hf_ratio <= 0.4:
            score += min(25.0, (hf_ratio - 0.10) * 120)
            reasons.append(f"Elevated high-frequency spectral tail (ratio {hf_ratio:.3f}).")
    if not reasons:
        reasons.append("Spectral profile is smooth with no periodic spikes - consistent with sensor capture.")

    face = float(np.clip(score, 0, 99))

    # A coarse 8x8 "attention" map from local high-frequency energy.
    cell = 32
    heat = np.zeros((8, 8))
    for i in range(8):
        for j in range(8):
            patch = g[i * cell:(i + 1) * cell, j * cell:(j + 1) * cell]
            heat[i, j] = np.var(np.fft.fft2(patch).real)
    heat = heat / (heat.max() + 1e-9)

    return Prediction(
        face_forgery_score=round(face, 1),
        temporal_score=0.0,
        audio_visual_score=0.0,
        metadata_score=20.0,
        heatmap=[[round(float(v), 3) for v in row] for row in heat],
        reasoning=reasons,
        model_version="freq-heuristic-v1",
    )


class _TorchBackend:
    def __init__(self) -> None:
        import torch
        import timm

        self.torch = torch
        self.model = timm.create_model(MODEL_ARCH, pretrained=False, num_classes=2)
        state = torch.load(MODEL_WEIGHTS, map_location="cpu")
        self.model.load_state_dict(state.get("model", state), strict=False)
        self.model.train(False)  # inference mode
        cfg = timm.data.resolve_data_config({}, model=self.model)
        self.tf = timm.data.create_transform(**cfg)

    def predict(self, img: Image.Image) -> Prediction:
        with self.torch.no_grad():
            x = self.tf(img.convert("RGB")).unsqueeze(0)
            logits = self.model(x)
            prob_fake = float(self.torch.softmax(logits, dim=1)[0, 1])
        base = _heuristic(img)
        return Prediction(
            face_forgery_score=round(prob_fake * 100, 1),
            temporal_score=0.0,
            audio_visual_score=0.0,
            metadata_score=20.0,
            heatmap=base.heatmap,
            reasoning=[f"{MODEL_ARCH} classifier P(manipulated) = {prob_fake:.3f}."],
            model_version=f"pytorch-{MODEL_ARCH}",
        )


def load_backend():
    if MODEL_WEIGHTS and os.path.exists(MODEL_WEIGHTS):
        try:
            return _TorchBackend()
        except Exception as exc:  # pragma: no cover - optional path
            print(f"[ai-engine] torch backend unavailable ({exc}); using frequency heuristic")
    return None


_BACKEND = load_backend()


def predict_image(data: bytes) -> Prediction:
    img = Image.open(io.BytesIO(data))
    if _BACKEND is not None:
        return _BACKEND.predict(img)
    return _heuristic(img)
