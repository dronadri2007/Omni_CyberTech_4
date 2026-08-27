import { randomUUID, createHash } from 'crypto';
import { MediaAnalyzer, AnalysisInput } from './MediaAnalyzer';
import { ForensicMediaAnalyzer } from './ForensicMediaAnalyzer';
import type { AnalysisCase, DetectionResult, RiskLevel, VerdictType } from '../../types';
import { env } from '../../config/env';

interface InferenceResponse {
  modelVersion?: string;
  faceForgeryScore?: number;
  temporalScore?: number;
  audioVisualScore?: number;
  metadataScore?: number;
  heatmapMatrix?: number[][];
  timelineAnomalies?: DetectionResult['timelineAnomalies'];
  waveformSegments?: DetectionResult['waveformSegments'];
  reasoning?: string[];
}

const TIMEOUT_MS = 20_000;

/**
 * Calls the Python FastAPI inference microservice (see `ai-engine/`). If the service
 * is unreachable or errors, it transparently falls back to the local forensic engine
 * so a demo never hard-fails on a missing GPU box.
 */
export class PyTorchMediaAnalyzer implements MediaAnalyzer {
  public readonly name = 'pytorch';
  private readonly fallback = new ForensicMediaAnalyzer();

  public async analyze(input: AnalysisInput): Promise<AnalysisCase> {
    let payload: InferenceResponse | undefined;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(env.AI_ENGINE_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          filename: input.filename,
          mimeType: input.mimeType,
          mediaCategory: input.mediaCategory,
          url: input.url,
          contentBase64: input.buffer ? input.buffer.toString('base64') : undefined,
        }),
      });
      clearTimeout(timer);
      if (res.ok) payload = (await res.json()) as InferenceResponse;
    } catch {
      /* fall through */
    }

    if (!payload) {
      const c = await this.fallback.analyze(input);
      c.detectionResults.reasoningHighlights.unshift('Model service unavailable — served by local forensic engine.');
      return c;
    }

    const now = new Date().toISOString();
    const caseId = `VF-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const face = clamp(payload.faceForgeryScore ?? 0);
    const temporal = clamp(payload.temporalScore ?? 0);
    const av = clamp(payload.audioVisualScore ?? 0);
    const metaManip = clamp(payload.metadataScore ?? 20);
    const active = [face, temporal, av, metaManip].filter((s) => s > 0);
    const manipulationProbability = Math.max(1, Math.min(99, Math.round(active.reduce((a, b) => a + b, 0) / (active.length || 1))));
    const authenticityScore = 100 - manipulationProbability;
    const { verdict, risk, review } = verdictFor(manipulationProbability);

    return {
      id: caseId,
      userId: input.userId ?? 'usr-demo-001',
      mediaId: `med-${randomUUID().slice(0, 12)}`,
      title: input.filename,
      verdict,
      confidence: manipulationProbability > 50 ? manipulationProbability : authenticityScore,
      authenticityScore,
      manipulationProbability,
      riskLevel: risk,
      status: 'COMPLETED',
      reviewRequired: review,
      mediaFile: {
        id: `med-${randomUUID().slice(0, 12)}`,
        filename: input.filename,
        mimeType: input.mimeType || 'application/octet-stream',
        sizeBytes: input.buffer?.length ?? input.sizeBytes ?? 0,
        fileHash: input.buffer ? createHash('sha256').update(input.buffer).digest('hex') : createHash('sha256').update(input.filename + now).digest('hex'),
        storageUrl: input.url ?? '',
        createdAt: now,
      },
      detectionResults: {
        id: `det-${randomUUID().slice(0, 12)}`,
        caseId,
        faceForgeryScore: face,
        temporalScore: temporal,
        audioVisualScore: av,
        metadataScore: metaManip,
        provenanceStatus: 'NOT_VERIFIED',
        modelVersion: payload.modelVersion ?? 'pytorch-ensemble',
        reasoningHighlights: payload.reasoning ?? ['Scored by the VERIFRAME model service.'],
        heatmapMatrix: payload.heatmapMatrix,
        timelineAnomalies: payload.timelineAnomalies,
        waveformSegments: payload.waveformSegments,
        createdAt: now,
      },
      provenanceDetails: {
        id: `prov-${randomUUID().slice(0, 12)}`,
        caseId,
        c2paValid: false,
        issuer: 'Not evaluated by model service',
        softwareHistory: [],
        exifData: { FileType: input.mimeType, AnalysisEngine: 'VERIFRAME model service' },
        chainOfCustody: [{ timestamp: now, action: 'Scored by model service', actor: input.userId ?? 'Analyst' }],
      },
      createdAt: now,
      updatedAt: now,
    };
  }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function verdictFor(m: number): { verdict: VerdictType; risk: RiskLevel; review: boolean } {
  if (m >= 80) return { verdict: 'MANIPULATED', risk: 'HIGH', review: true };
  if (m >= 62) return { verdict: 'SUSPICIOUS', risk: 'MEDIUM', review: true };
  if (m >= 45) return { verdict: 'INCONCLUSIVE', risk: 'MEDIUM', review: true };
  return { verdict: 'AUTHENTIC', risk: 'LOW', review: false };
}
