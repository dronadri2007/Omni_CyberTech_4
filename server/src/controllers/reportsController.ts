import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { store } from '../services/store';

export const getReportByCaseId = asyncHandler(async (req, res) => {
  const item = await store.getCaseById(req.params.caseId);
  if (!item) throw AppError.notFound('Case not found');

  res.status(200).json({
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
      status: item.status,
    },
    mediaDetails: item.mediaFile,
    detectionBreakdown: {
      faceForgeryScore: item.detectionResults.faceForgeryScore,
      temporalConsistencyScore: item.detectionResults.temporalScore,
      audioVisualSyncScore: item.detectionResults.audioVisualScore,
      metadataRiskScore: item.detectionResults.metadataScore,
      provenanceStatus: item.detectionResults.provenanceStatus,
      modelVersion: item.detectionResults.modelVersion,
    },
    reasoning: item.detectionResults.reasoningHighlights,
    provenance: item.provenanceDetails,
    disclaimer:
      'VERIFRAME analysis is an AI-assisted probabilistic evaluation based on pixel forensics, metadata, and C2PA provenance. Evaluate alongside contextual journalistic evidence.',
  });
});
