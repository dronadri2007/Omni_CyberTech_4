# VERIFRAME — Multimodal Deepfake & Media Verification Platform

> **Verify what you see. Trust what you share.**

VERIFRAME is an enterprise-grade cybersecurity and AI-powered media verification platform designed to ingest images, videos, audio recordings, and social media URLs to detect deepfakes, synthetic voice clones, digital tamperings, and suspicious provenance.

Built for social-media users, journalists, fact-checkers, election integrity teams, and SOC cybersecurity analysts.

---

## Technical Architecture Overview

```text
veriframe/
│
├── client/                     # React + TypeScript + Vite + Tailwind CSS + Framer Motion
│   ├── src/
│   │   ├── components/         # SOC Badges, Visual Grad-CAM Canvas, Video Timeline, Audio Waveform
│   │   ├── pages/              # 17 Responsive Views (Landing, Dashboard, Analyze, Results, Evidence, etc.)
│   │   ├── services/           # API Client with zero-downtime mock fallback
│   │   ├── context/            # AuthContext for role-based authentication
│   │   └── types/              # Shared TypeScript data schemas
│
├── server/                     # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── controllers/        # Auth, Analyze, Cases, Reviews, Reports, Stats Controllers
│   │   ├── services/
│   │   │   ├── MockStore.ts    # Standalone pre-seeded data store with full persistence
│   │   │   └── analysisEngine/ # Modular MediaAnalyzer Interface & MockMediaAnalyzer
│   │   └── index.ts            # Express server initialization
│
├── database/                   # PostgreSQL Schema & Seed Files
│   ├── schema.sql              # Relational tables: users, analysis_cases, media_files, detection_results, etc.
│   └── seed.sql                # Pre-seeded hackathon demo cases
│
└── package.json                # Unified workspace scripts
```

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### 1. Install Dependencies
Run the following command from the root directory to install all packages for root, server, and client:

```bash
npm run install:all
```

### 2. Start Development Servers
Run the backend API server and frontend client concurrently:

* **Backend API**: Starts on `http://localhost:5000`
* **Frontend Web App**: Starts on `http://localhost:3000`

```bash
# Terminal 1: Start Backend Express Server
npm run dev:server

# Terminal 2: Start Frontend React Client
npm run dev:client
```

---

## 🧠 Modular AI Engine & PyTorch Handoff Architecture

VERIFRAME uses a decoupled strategy pattern for deepfake inference. The server defines a standard TypeScript interface:

```typescript
// server/src/services/analysisEngine/MediaAnalyzer.ts
export interface MediaAnalyzer {
  analyze(input: AnalysisInput): Promise<AnalysisCase>;
}
```

### Swapping Mock Detector with Real PyTorch Models

To replace the included `MockMediaAnalyzer` with a real PyTorch/FastAPI model server (e.g., XceptionNet, EfficientNet-B4, Wav2Vec2, or C2PA PyC2PA library):

1. Create `PyTorchMediaAnalyzer.ts` implementing `MediaAnalyzer`.
2. Send HTTP requests to your Python inference microservice (`http://localhost:8000/predict`).
3. Update `server/src/controllers/analyzeController.ts` to instantiate `PyTorchMediaAnalyzer`.

---

## 🏆 Hackathon Judge Presentation Flow

To demonstrate the full capability of VERIFRAME during a live demo:

1. **Landing Page (`http://localhost:3000/`)**: Point out the live SOC preview mockup, tagline, and 6 core detection capabilities.
2. **Click "ANALYZE MEDIA"**: Opens `/analyze`.
3. **1-Click Demo Quick Load**: Click **"Sample 1: Deepfake Video"**.
4. **Animated Processing Workflow (`/analyze/processing/VF-2026-000124`)**: Observe the 7-stage animated progress screen executing spatial, temporal, spectral, and C2PA checks.
5. **Analysis Results (`/analyze/results/VF-2026-000124`)**: Review the **87% LIKELY MANIPULATED** verdict, circular score gauge, and explainable AI metrics.
6. **Interactive Evidence Viewer (`/evidence/VF-2026-000124`)**: Toggle between **Original**, **AI Heatmap**, **Overlay**, and **Side-by-Side** Grad-CAM visual overlays.
7. **C2PA Provenance (`/provenance/VF-2026-000124`)**: Inspect unverified hardware cryptographic manifests and software modification history.
8. **Human Review Queue (`/review`)**: Demonstrate expert reviewer notes and verdict override capability.
9. **Verification Report (`/reports/VF-2026-000124`)**: Download the PDF verification certificate or export raw JSON metrics.

---

## 🗄️ Database Setup (Optional PostgreSQL)

If you prefer to run against a real PostgreSQL instance instead of the built-in standalone `MockStore`:

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE veriframe_db;
   ```
2. Execute schema & seed scripts:
   ```bash
   psql -d veriframe_db -f database/schema.sql
   psql -d veriframe_db -f database/seed.sql
   ```
3. Set `DATABASE_URL` in `.env`.

---

## 📄 License & Attribution
VERIFRAME — Hackathon Problem Statement **Omni_CyberTech_4 — Detecting Deepfake and Manipulated Media**.
MIT License.
