"""VERIFRAME model inference microservice.

Contract (called by server/src/services/analysisEngine/PyTorchMediaAnalyzer.ts):

POST /v1/inference
  { "filename", "mimeType", "mediaCategory", "url"?, "contentBase64"? }
  ->
  { "modelVersion", "faceForgeryScore", "temporalScore", "audioVisualScore",
    "metadataScore", "heatmapMatrix", "reasoning" }
"""
from __future__ import annotations

import base64
import os
import urllib.request

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .model import predict_image

app = FastAPI(title="VERIFRAME Inference Service", version="1.0.0")

MAX_BYTES = int(os.getenv("MAX_BYTES", str(25 * 1024 * 1024)))


class InferenceRequest(BaseModel):
    filename: str
    mimeType: str = "application/octet-stream"
    mediaCategory: str = "IMAGE"
    url: str | None = None
    contentBase64: str | None = None


class InferenceResponse(BaseModel):
    modelVersion: str
    faceForgeryScore: float
    temporalScore: float
    audioVisualScore: float
    metadataScore: float
    heatmapMatrix: list[list[float]]
    reasoning: list[str]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ONLINE", "service": "veriframe-inference"}


@app.post("/v1/inference", response_model=InferenceResponse)
def inference(req: InferenceRequest) -> InferenceResponse:
    data: bytes | None = None
    if req.contentBase64:
        data = base64.b64decode(req.contentBase64)
    elif req.url:
        with urllib.request.urlopen(req.url, timeout=8) as r:  # noqa: S310 - server-side fetch of caller-supplied URL
            data = r.read(MAX_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="Provide contentBase64 or url")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Media too large")

    if req.mediaCategory not in ("IMAGE", "URL"):
        # Video/audio frame + spectral models are not in this build.
        return InferenceResponse(
            modelVersion="unsupported-modality",
            faceForgeryScore=0.0,
            temporalScore=0.0,
            audioVisualScore=0.0,
            metadataScore=20.0,
            heatmapMatrix=[[0.0] * 8 for _ in range(8)],
            reasoning=[f"{req.mediaCategory} inference not available in this model build."],
        )

    p = predict_image(data)
    return InferenceResponse(
        modelVersion=p.model_version,
        faceForgeryScore=p.face_forgery_score,
        temporalScore=p.temporal_score,
        audioVisualScore=p.audio_visual_score,
        metadataScore=p.metadata_score,
        heatmapMatrix=p.heatmap,
        reasoning=p.reasoning,
    )
