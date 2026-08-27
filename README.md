# VERIFRAME — Multimodal Deepfake & Media Verification Platform

> **Verify what you see. Trust what you share.**

Hackathon problem statement **Omni_CyberTech_4 — Detecting Deepfake and Manipulated Media** · Team **codeX** · Omnikon National Hackathon 2026.

VERIFRAME ingests images, video, audio, and social/media URLs and returns a
manipulation-confidence verdict with explainable evidence: an anomaly heatmap,
metadata inconsistencies, and C2PA / Content-Credentials provenance — plus a
human-in-the-loop review queue for borderline cases.

---

## What is real vs. what is the next slot

| Layer | Status |
|---|---|
| 17-page React SOC console, Express REST API, review workflow, reports | **Built** |
| Auth: JWT + bcrypt, RBAC middleware, rate limiting, helmet, zod validation | **Built** |
| **Forensic detection engine** — Error-Level-Analysis heatmap, noise/smoothness stats, EXIF extraction + inconsistency flags, C2PA manifest probe | **Built** (real signal, **no ML model**) |
| PostgreSQL persistence (falls back to in-memory) | **Built** |
| Python FastAPI inference service — frequency-domain heuristic backend | **Built**; trained-model backend is a drop-in (`MODEL_WEIGHTS`) |
| Trained face-forgery / synthetic-voice models, video frame + audio extraction, Chrome extension, chat bots | **Roadmap** |

The detection engine sits behind one interface
(`server/src/services/analysisEngine/MediaAnalyzer.ts`). `ANALYZER=forensic|mock|pytorch`
swaps the implementation with no change anywhere else.

---

## Architecture

```text
veriframe/
├── client/        React 18 + Vite + TS + Tailwind + Framer Motion + Recharts
│   └── src/services/api.ts     server-authoritative API client (Bearer token, slim offline fallback)
├── server/        Node + Express + TS
│   └── src/
│       ├── config/env.ts       zod-validated environment
│       ├── middleware/          auth (JWT), validate (zod), errorHandler
│       ├── services/
│       │   ├── authService.ts   bcrypt + JWT
│       │   ├── analysisEngine/  MediaAnalyzer + Forensic / Mock / PyTorch impls + forensic/{ela,exif,c2pa,imageStats}
│       │   └── store/           Store interface → MemoryStore | PgStore
│       └── db/                  pg pool + migrate runner
├── ai-engine/     FastAPI inference microservice (frequency heuristic; torch backend optional)
├── database/      schema.sql + migrations/
└── docker-compose.yml   db + ai-engine + server + client
```

Request flow: browser → (`/api` proxy) → Express → `requireAuth` → `validate` →
controller → `analyzer.analyze()` → `store.addCase()` → response.

---

## Quick start (local, zero config)

```bash
npm run install:all          # root + server + client
cp .env.example .env          # optional — sensible defaults are built in

# terminal 1
npm run dev:server            # http://localhost:5000  (ANALYZER=forensic, in-memory store)
# terminal 2
npm run dev:client            # http://localhost:3000
```

Open `http://localhost:3000`. You are auto-signed-in as the demo fact-checker.

**Demo credentials** (also on the login page): `sarah.vance@factcheck.org` /
`alex.mercer@cybersec.io`, password `veriframe-demo`.

### Run everything in Docker (with PostgreSQL + model service)

```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
# client  → http://localhost:8080
# api     → http://localhost:5000/api/health
```

### Use the Python model service

```bash
cd ai-engine && pip install -r requirements.txt
uvicorn app.main:app --port 8000
# then run the API with:
ANALYZER=pytorch AI_ENGINE_SERVICE_URL=http://localhost:8000/v1/inference npm run dev:server
```

If the service is unreachable the API transparently falls back to the forensic engine.

---

## Configuration (`.env`)

| Var | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | API port |
| `JWT_SECRET` | dev-only fallback | **required in production** |
| `JWT_EXPIRES_IN` | `12h` | token lifetime |
| `ANALYZER` | `forensic` | `forensic` \| `mock` \| `pytorch` |
| `AI_ENGINE_SERVICE_URL` | `http://localhost:8000/v1/inference` | model service endpoint |
| `DATABASE_URL` | _(unset → in-memory)_ | Postgres connection string |
| `CORS_ORIGINS` | `http://localhost:3000` | comma-separated allowlist |
| `MAX_UPLOAD_MB` | `50` | multer upload cap |

---

## Database (optional)

```bash
createdb veriframe_db
DATABASE_URL=postgres://postgres:postgres@localhost:5432/veriframe_db npm run db:migrate
```

`db:migrate` applies `database/schema.sql` + everything in `database/migrations/`
and seeds demo cases if the store is empty. With `DATABASE_URL` set the API uses
`PgStore`; otherwise `MemoryStore` (resets on restart).

---

## Detection engine — what it actually computes

`ForensicMediaAnalyzer` (images):

* **Error Level Analysis** — recompress at a fixed quality, diff against the
  original, measure where recompression residue concentrates (spliced regions
  spike). Produces the 8×8 heatmap the evidence viewer renders.
* **Noise / smoothness statistics** — high-frequency energy vs. a blur; an
  unnaturally low noise floor on a photo-sized image is a GAN / heavy-denoise tell.
* **EXIF** (`exifr`) — camera make/model, software history, capture-vs-modify time
  gaps, generative-tool signatures, forged-header patterns.
* **C2PA** — cryptographic validation via optional `c2pa-node`, or JUMBF
  byte-marker detection (manifest present but unverified) as an honest fallback.

Scores are aggregated with a provenance penalty into a `manipulationProbability`
and verdict. Video/audio currently use metadata + provenance only and say so in
the reasoning; full frame/spectral analysis is the model-service's job.

The Python `freq-heuristic-v1` backend analyses the 2-D power spectrum for
periodic upsampling spikes. Both heuristics are deliberately conservative and are
labelled as placeholders for a trained model.

---

## Tests & CI

```bash
npm test                     # server: vitest + supertest (auth, API, forensic units)
npm run typecheck            # strict tsc, server + client
```

GitHub Actions (`.github/workflows/ci.yml`) runs typecheck + build + tests for the
server and client, a smoke test for the Python service, and `docker compose config`.

---

## Security notes

* Passwords are bcrypt-hashed; tokens are HS256 JWT. `requireAuth` guards every
  mutation (`POST /analyze`, `DELETE /cases/:id`, review + key endpoints);
  read paths use `optionalAuth`.
* `helmet`, global + per-route `express-rate-limit`, CORS origin allowlist,
  `x-powered-by` disabled, 1 MB JSON body cap, multer mime allowlist.
* No secrets in the repo — `.env.example` ships placeholders only.

## License

MIT.
