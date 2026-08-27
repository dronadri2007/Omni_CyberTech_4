# VERIFRAME Inference Service

FastAPI microservice behind the `MediaAnalyzer` seam. The Node API calls it when
`ANALYZER=pytorch` (`server/src/services/analysisEngine/PyTorchMediaAnalyzer.ts`),
and falls back to the local forensic engine if this service is down.

## Run

```bash
cd ai-engine
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then start the API with `ANALYZER=pytorch AI_ENGINE_SERVICE_URL=http://localhost:8000/v1/inference`.

## Backends

| Backend | When | What it does |
|---|---|---|
| `freq-heuristic-v1` | default | 2-D power-spectrum analysis (high-frequency tail + periodic spikes). Real signal, no training. |
| `pytorch-<arch>` | `pip install torch torchvision timm` **and** `MODEL_WEIGHTS=/path/to/ckpt.pt` | Trained face-forgery classifier (EfficientNet-B4 / Xception on FaceForensics++, DFDC, Celeb-DF). |

## Endpoint

`POST /v1/inference` — see `app/main.py` for the request/response schema. `GET /health` for liveness.
