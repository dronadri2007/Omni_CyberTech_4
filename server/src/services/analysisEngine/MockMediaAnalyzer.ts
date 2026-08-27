import { MediaAnalyzer, AnalysisInput } from './MediaAnalyzer';
import { AnalysisCase, VerdictType, RiskLevel, ProvenanceStatus } from '../../types';

export class MockMediaAnalyzer implements MediaAnalyzer {
  public async analyze(input: AnalysisInput): Promise<AnalysisCase> {
    // Generate deterministic case ID
    const caseNum = Math.floor(100000 + Math.random() * 900000);
    const caseId = `VF-2026-${caseNum}`;
    const timestamp = new Date().toISOString();

    const filenameLower = input.filename.toLowerCase();
    const isAudio = input.mediaCategory === 'AUDIO' || filenameLower.endsWith('.mp3') || filenameLower.endsWith('.wav') || filenameLower.endsWith('.m4a');
    const isVideo = input.mediaCategory === 'VIDEO' || filenameLower.endsWith('.mp4') || filenameLower.endsWith('.mov') || filenameLower.endsWith('.avi');
    const isImage = input.mediaCategory === 'IMAGE' || filenameLower.endsWith('.jpg') || filenameLower.endsWith('.jpeg') || filenameLower.endsWith('.png') || filenameLower.endsWith('.webp');

    // Determine storage URL dynamically based on uploaded buffer or URL link
    let storageUrl = '';
    if (input.buffer) {
      storageUrl = `data:${input.mimeType || 'image/png'};base64,${input.buffer.toString('base64')}`;
    } else if (input.url) {
      storageUrl = input.url;
    } else if (isImage) {
      storageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80';
    } else if (isAudio) {
      storageUrl = 'https://actions.google.com/sounds/v1/ambiences/office_noise.ogg';
    } else {
      storageUrl = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
    }

    // Simulate realistic heuristic detection logic based on filename cues or random seed for uploaded files
    let faceForgeryScore = 15;
    let temporalScore = 10;
    let audioVisualScore = 10;
    let metadataScore = 20;
    let provenanceStatus: ProvenanceStatus = 'NOT_VERIFIED';

    if (filenameLower.includes('fake') || filenameLower.includes('deep') || filenameLower.includes('synth') || filenameLower.includes('clone')) {
      faceForgeryScore = 92;
      temporalScore = 87;
      audioVisualScore = 84;
      metadataScore = 78;
      provenanceStatus = 'NOT_VERIFIED';
    } else if (filenameLower.includes('auth') || filenameLower.includes('real') || filenameLower.includes('raw') || filenameLower.includes('news')) {
      faceForgeryScore = 5;
      temporalScore = 4;
      audioVisualScore = 3;
      metadataScore = 95;
      provenanceStatus = 'VERIFIED';
    } else {
      // General deterministic distribution based on name length/hash
      const seed = input.filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      faceForgeryScore = Math.min(95, Math.max(10, (seed * 17) % 95));
      temporalScore = isVideo ? Math.min(92, Math.max(15, (seed * 23) % 92)) : 0;
      audioVisualScore = (isVideo || isAudio) ? Math.min(90, Math.max(12, (seed * 31) % 90)) : 0;
      metadataScore = Math.min(95, Math.max(20, (seed * 11) % 95));
      provenanceStatus = (seed % 3 === 0) ? 'VERIFIED' : (seed % 3 === 1 ? 'SUSPICIOUS' : 'NOT_VERIFIED');
    }

    // Calculate aggregated manipulation probability
    const activeScores = [faceForgeryScore, temporalScore, audioVisualScore, 100 - metadataScore].filter(s => s > 0);
    const avgManipulation = Math.round(activeScores.reduce((a, b) => a + b, 0) / (activeScores.length || 1));
    const manipulationProbability = Math.min(99, Math.max(1, avgManipulation));
    const authenticityScore = 100 - manipulationProbability;

    let verdict: VerdictType = 'AUTHENTIC';
    let riskLevel: RiskLevel = 'LOW';
    let reviewRequired = false;

    if (manipulationProbability >= 80) {
      verdict = 'MANIPULATED';
      riskLevel = 'HIGH';
      reviewRequired = true;
    } else if (manipulationProbability >= 65) {
      verdict = 'SUSPICIOUS';
      riskLevel = 'MEDIUM';
      reviewRequired = true;
    } else if (manipulationProbability >= 45) {
      verdict = 'INCONCLUSIVE';
      riskLevel = 'MEDIUM';
      reviewRequired = true;
    } else {
      verdict = 'AUTHENTIC';
      riskLevel = 'LOW';
      reviewRequired = false;
    }

    // Build reasoning highlights
    const reasoningHighlights: string[] = [];
    if (faceForgeryScore > 70) {
      reasoningHighlights.push(`High spatial frequency anomalies detected in facial landmark region (${faceForgeryScore}% manipulation likelihood).`);
    }
    if (temporalScore > 70) {
      reasoningHighlights.push(`Frame-to-frame optical flow discontinuities flagged across keyframes (${temporalScore}% anomaly rating).`);
    }
    if (audioVisualScore > 70) {
      reasoningHighlights.push(`Lip movement phase lag does not align with voice formant harmonics (${audioVisualScore}% sync mismatch).`);
    }
    if (provenanceStatus !== 'VERIFIED') {
      reasoningHighlights.push(`C2PA provenance chain could not be cryptographically authenticated.`);
    } else {
      reasoningHighlights.push(`Valid C2PA digital watermark signature present.`);
    }

    if (reasoningHighlights.length === 0) {
      reasoningHighlights.push('No significant generative neural network artifacts detected.');
      reasoningHighlights.push('Lighting consistency and pixel noise distribution match authentic sensor capture.');
    }

    // Generate image heatmap matrix
    const heatmapMatrix = [
      [0.05, 0.10, 0.15, 0.10, 0.05],
      [0.10, faceForgeryScore / 100, Math.min(0.99, (faceForgeryScore + 10) / 100), faceForgeryScore / 100, 0.10],
      [0.15, faceForgeryScore / 100, Math.min(0.99, (faceForgeryScore + 15) / 100), faceForgeryScore / 100, 0.15],
      [0.10, 0.40, 0.50, 0.40, 0.10],
      [0.05, 0.10, 0.15, 0.10, 0.05]
    ];

    return {
      id: caseId,
      userId: input.userId || 'usr-demo-001',
      mediaId: `med-${Date.now()}`,
      title: input.filename,
      verdict,
      confidence: manipulationProbability > 50 ? manipulationProbability : authenticityScore,
      authenticityScore,
      manipulationProbability,
      riskLevel,
      status: 'COMPLETED',
      reviewRequired,
      mediaFile: {
        id: `med-${Date.now()}`,
        filename: input.filename,
        mimeType: input.mimeType || (isImage ? 'image/jpeg' : isVideo ? 'video/mp4' : 'audio/wav'),
        sizeBytes: input.sizeBytes || 5242880,
        fileHash: Buffer.from(input.filename + timestamp).toString('hex').substring(0, 64),
        storageUrl,
        createdAt: timestamp,
      },
      detectionResults: {
        id: `det-${Date.now()}`,
        caseId,
        faceForgeryScore,
        temporalScore,
        audioVisualScore,
        metadataScore,
        provenanceStatus,
        modelVersion: 'v2.4-ensemble-deepfake',
        reasoningHighlights,
        heatmapMatrix,
        timelineAnomalies: isVideo ? [
          { timestampSec: 1.2, score: faceForgeryScore / 100, label: 'Facial boundary artifact' },
          { timestampSec: 3.5, score: temporalScore / 100, label: 'Frame interpolation anomaly' },
          { timestampSec: 6.8, score: audioVisualScore / 100, label: 'Audio-visual lip sync offset' }
        ] : undefined,
        waveformSegments: isAudio ? [
          { startTimeSec: 0.8, endTimeSec: 2.4, anomalyScore: faceForgeryScore / 100, label: 'Neural vocoder phase phase distortion' },
          { startTimeSec: 4.1, endTimeSec: 6.2, anomalyScore: 0.82, label: 'Synthetic frequency drop' }
        ] : undefined,
        createdAt: timestamp,
      },
      provenanceDetails: {
        id: `prov-${Date.now()}`,
        caseId,
        c2paValid: provenanceStatus === 'VERIFIED',
        issuer: provenanceStatus === 'VERIFIED' ? 'C2PA Security Alliance' : 'Unverified Origin',
        signatureTimestamp: provenanceStatus === 'VERIFIED' ? timestamp : undefined,
        cameraMake: provenanceStatus === 'VERIFIED' ? 'Sony' : 'Unknown Hardware',
        cameraModel: provenanceStatus === 'VERIFIED' ? 'ILCE-7M4' : 'Virtual Device Engine',
        softwareHistory: provenanceStatus === 'VERIFIED' ? ['Raw Camera Export'] : ['FFmpeg Core', 'Adobe Premiere Pro 2024'],
        exifData: {
          FileType: input.mimeType,
          AnalysisTimestamp: timestamp,
          ProcessingEngine: 'VERIFRAME AI SOC v2.4'
        },
        chainOfCustody: [
          { timestamp, action: 'Ingested via VERIFRAME REST API', actor: input.userId || 'Analyst' }
        ]
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
}
