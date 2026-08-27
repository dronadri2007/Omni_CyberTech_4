import { randomUUID, createHash } from 'crypto';
import { MediaAnalyzer, AnalysisInput } from './MediaAnalyzer';
import type { AnalysisCase, DetectionResult, ProvenanceDetails, RiskLevel, VerdictType } from '../../types';
import { errorLevelAnalysis } from './forensic/ela';
import { readExif } from './forensic/exif';
import { verifyC2pa } from './forensic/c2pa';
import { imageStats } from './forensic/imageStats';

const MAX_FETCH_BYTES = 25 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8000;

async function resolveBytes(input: AnalysisInput): Promise<Buffer | undefined> {
  if (input.buffer && input.buffer.length) return input.buffer;
  if (!input.url) return undefined;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(input.url, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timer);
    if (!res.ok) return undefined;
    const len = Number(res.headers.get('content-length') ?? 0);
    if (len && len > MAX_FETCH_BYTES) return undefined;
    const ab = await res.arrayBuffer();
    if (ab.byteLength > MAX_FETCH_BYTES) return undefined;
    return Buffer.from(ab);
  } catch {
    return undefined;
  }
}

function verdictFor(manipulation: number, reviewFloor: boolean): { verdict: VerdictType; risk: RiskLevel; review: boolean } {
  if (manipulation >= 80) return { verdict: 'MANIPULATED', risk: 'HIGH', review: true };
  if (manipulation >= 62) return { verdict: 'SUSPICIOUS', risk: 'MEDIUM', review: true };
  if (manipulation >= 45) return { verdict: 'INCONCLUSIVE', risk: 'MEDIUM', review: true };
  return { verdict: 'AUTHENTIC', risk: 'LOW', review: reviewFloor };
}

export class ForensicMediaAnalyzer implements MediaAnalyzer {
  public readonly name = 'forensic';

  public async analyze(input: AnalysisInput): Promise<AnalysisCase> {
    const now = new Date().toISOString();
    const caseId = `VF-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const bytes = await resolveBytes(input);
    const category =
      input.mediaCategory === 'URL'
        ? input.mimeType.startsWith('video/')
          ? 'VIDEO'
          : input.mimeType.startsWith('audio/')
            ? 'AUDIO'
            : 'IMAGE'
        : input.mediaCategory;
    const isImage = category === 'IMAGE';

    const reasoning: string[] = [];
    let faceForgeryScore = 0;
    let temporalScore = 0;
    let audioVisualScore = 0;
    let metadataScore = 20; // metadata *health* (higher = healthier), inverted into manipulation later
    let heatmapMatrix: number[][] | undefined;

    // ---- Provenance (all media types) ----
    const c2pa = bytes
      ? await verifyC2pa(bytes, input.mimeType || 'application/octet-stream')
      : { status: 'UNAVAILABLE' as const, present: false, verified: false, detail: 'Media bytes unavailable for provenance check.' };
    reasoning.push(c2pa.detail);

    // ---- Metadata (images + many video/audio containers) ----
    let exif: Awaited<ReturnType<typeof readExif>> | undefined;
    if (bytes) {
      exif = await readExif(bytes);
      metadataScore = 100 - exif.metadataRisk; // health
      exif.inconsistencies.forEach((i) => reasoning.push(i));
    } else {
      reasoning.push('No file bytes available — analysis limited to the supplied URL metadata.');
    }

    // ---- Pixel forensics (images only) ----
    if (isImage && bytes) {
      try {
        const [ela, stats] = await Promise.all([errorLevelAnalysis(bytes), imageStats(bytes)]);
        heatmapMatrix = ela.heatmapMatrix;
        faceForgeryScore = Math.round(Math.min(100, ela.elaScore * 0.65 + stats.syntheticSmoothness * 0.6));
        if (ela.elaScore > 45)
          reasoning.push(
            `Error-Level-Analysis residue concentrates at grid cell (${ela.hotCell.row}, ${ela.hotCell.col}) — score ${ela.elaScore}/100.`,
          );
        stats.notes.forEach((n) => reasoning.push(n));
        if (faceForgeryScore < 25 && ela.elaScore < 30 && stats.syntheticSmoothness < 20)
          reasoning.push('Recompression residue is uniform and the noise floor matches sensor capture.');
      } catch (e) {
        reasoning.push(`Pixel-level analysis could not run on this image format (${(e as Error).message}).`);
      }
    } else if (!isImage) {
      reasoning.push(
        `${category} frame/audio analysis requires the model service (ANALYZER=pytorch). This verdict uses metadata + provenance only.`,
      );
      // For non-images we lean on metadata + provenance signal.
      temporalScore = category === 'VIDEO' ? Math.round((exif?.metadataRisk ?? 40) * 0.5) : 0;
      audioVisualScore = category === 'AUDIO' ? Math.round((exif?.metadataRisk ?? 40) * 0.5) : 0;
    }

    // ---- Aggregate ----
    const provenancePenalty = c2pa.verified ? -8 : c2pa.present ? 25 : 10;
    const metadataManipulation = 100 - metadataScore;
    const active = [faceForgeryScore, temporalScore, audioVisualScore, metadataManipulation].filter((s) => s > 0);
    const base = active.length ? active.reduce((a, b) => a + b, 0) / active.length : metadataManipulation;
    const manipulationProbability = Math.max(1, Math.min(99, Math.round(base * 0.8 + provenancePenalty)));
    const authenticityScore = 100 - manipulationProbability;

    const reviewFloor = !c2pa.verified && manipulationProbability >= 35;
    const { verdict, risk, review } = verdictFor(manipulationProbability, reviewFloor);

    if (c2pa.verified) reasoning.unshift('Valid C2PA provenance chain present.');
    if (reasoning.length === 0) reasoning.push('No significant manipulation indicators detected.');

    const fileHash = bytes ? createHash('sha256').update(bytes).digest('hex') : createHash('sha256').update(input.filename + now).digest('hex');

    // Embed small uploads so every client view can render the exact media without a storage backend.
    let storageUrl = input.url ?? '';
    if (!storageUrl && bytes && bytes.length <= 6 * 1024 * 1024 && (input.mimeType || '').startsWith('image/')) {
      storageUrl = `data:${input.mimeType};base64,${bytes.toString('base64')}`;
    }

    const detectionResults: DetectionResult = {
      id: `det-${randomUUID().slice(0, 12)}`,
      caseId,
      faceForgeryScore,
      temporalScore,
      audioVisualScore,
      metadataScore: metadataManipulation,
      provenanceStatus: c2pa.status,
      modelVersion: 'forensic-v1-noml',
      reasoningHighlights: reasoning.slice(0, 8),
      heatmapMatrix,
      timelineAnomalies:
        category === 'VIDEO'
          ? [{ timestampSec: 0, score: temporalScore / 100, label: 'Container/metadata anomaly (frame analysis pending model service)' }]
          : undefined,
      waveformSegments:
        category === 'AUDIO'
          ? [{ startTimeSec: 0, endTimeSec: 0, anomalyScore: audioVisualScore / 100, label: 'Metadata anomaly (spectral analysis pending model service)' }]
          : undefined,
      createdAt: now,
    };

    const provenanceDetails: ProvenanceDetails = {
      id: `prov-${randomUUID().slice(0, 12)}`,
      caseId,
      c2paValid: c2pa.verified,
      issuer: c2pa.issuer ?? (c2pa.present ? 'Unverified issuer' : 'No manifest'),
      signatureTimestamp: c2pa.signedAt,
      cameraMake: exif?.cameraMake ?? (c2pa.verified ? undefined : 'Unknown'),
      cameraModel: exif?.cameraModel ?? (c2pa.claimGenerator ?? 'Unknown'),
      softwareHistory: exif?.software.length ? exif.software : c2pa.claimGenerator ? [c2pa.claimGenerator] : [],
      exifData: {
        ...(exif?.raw ?? {}),
        FileType: input.mimeType,
        AnalysisEngine: 'VERIFRAME forensic-v1',
        AnalysisTimestamp: now,
      },
      chainOfCustody: [
        {
          timestamp: now,
          action: input.url ? `Fetched from ${input.url}` : 'Ingested via VERIFRAME REST API',
          actor: input.userId ?? 'Analyst',
        },
      ],
    };

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
        sizeBytes: bytes?.length ?? input.sizeBytes ?? 0,
        fileHash,
        storageUrl,
        createdAt: now,
      },
      detectionResults,
      provenanceDetails,
      createdAt: now,
      updatedAt: now,
    };
  }
}
