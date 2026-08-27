import { Request, Response } from 'express';
import { MockStore } from '../services/MockStore';

export const getReportByCaseId = (req: Request, res: Response) => {
  const { caseId } = req.params;
  const item = MockStore.getCaseById(caseId);

  if (!item) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const reportData = {
    reportId: `REP-${item.id}`,
    platform: 'VERIFRAME Multimodal Media Verification SOC',
    generatedAt: new Date().toISOString(),
    caseSummary: {
      caseId: item.id,
      title: item.title,
      submittedAt: item.createdAt,
      verdict: item.verdict,
      authenticityScore: item.authenticityScore,
      manipulationProbability: item.manipulationProbability,
      riskLevel: item.riskLevel,
      status: item.status
    },
    mediaDetails: item.mediaFile,
    detectionBreakdown: {
      faceForgeryScore: item.detectionResults.faceForgeryScore,
      temporalConsistencyScore: item.detectionResults.temporalScore,
      audioVisualSyncScore: item.detectionResults.audioVisualScore,
      metadataRiskScore: item.detectionResults.metadataScore,
      provenanceStatus: item.detectionResults.provenanceStatus,
      modelVersion: item.detectionResults.modelVersion
    },
    reasoning: item.detectionResults.reasoningHighlights,
    provenance: item.provenanceDetails,
    disclaimer: 'Notice: VERIFRAME deepfake analysis is an AI-assisted probabilistic evaluation based on neural ensemble metrics, frequency spectra, and C2PA manifests. It should be evaluated alongside contextual journalistic evidence.'
  };

  return res.status(200).json(reportData);
};
