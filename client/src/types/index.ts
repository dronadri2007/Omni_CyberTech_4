export type MediaCategory = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'URL';
export type VerdictType = 'AUTHENTIC' | 'SUSPICIOUS' | 'MANIPULATED' | 'INCONCLUSIVE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CaseStatus = 'PROCESSING' | 'COMPLETED' | 'IN_REVIEW' | 'ARCHIVED';
export type ProvenanceStatus = 'VERIFIED' | 'NOT_VERIFIED' | 'SUSPICIOUS' | 'UNAVAILABLE';
export type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'OVERRIDDEN' | 'REJECTED' | 'ESCALATED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'analyst' | 'journalist' | 'fact_checker' | 'reviewer' | 'admin';
  token?: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  fileHash: string;
  storageUrl: string;
  createdAt: string;
}

export interface DetectionResult {
  id: string;
  caseId: string;
  faceForgeryScore: number;
  temporalScore: number;
  audioVisualScore: number;
  metadataScore: number;
  provenanceStatus: ProvenanceStatus;
  modelVersion: string;
  reasoningHighlights: string[];
  heatmapMatrix?: number[][];
  timelineAnomalies?: Array<{ timestampSec: number; score: number; label: string }>;
  waveformSegments?: Array<{ startTimeSec: number; endTimeSec: number; anomalyScore: number; label: string }>;
  createdAt: string;
}

export interface ProvenanceDetails {
  id: string;
  caseId: string;
  c2paValid: boolean;
  issuer?: string;
  signatureTimestamp?: string;
  cameraMake?: string;
  cameraModel?: string;
  softwareHistory: string[];
  exifData: Record<string, any>;
  chainOfCustody?: Array<{ timestamp: string; action: string; actor: string }>;
}

export interface AnalysisCase {
  id: string;
  userId: string;
  mediaId: string;
  mediaFile: MediaFile;
  title: string;
  verdict: VerdictType;
  confidence: number;
  authenticityScore: number;
  manipulationProbability: number;
  riskLevel: RiskLevel;
  status: CaseStatus;
  reviewRequired: boolean;
  detectionResults: DetectionResult;
  provenanceDetails: ProvenanceDetails;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCase {
  id: string;
  caseId: string;
  caseData?: AnalysisCase;
  reviewerId?: string;
  reviewerName?: string;
  status: ReviewStatus;
  reviewerVerdict?: VerdictType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisStats {
  totalAnalyses: number;
  suspiciousCount: number;
  manipulatedCount: number;
  authenticCount: number;
  inconclusiveCount: number;
  humanReviewsCount: number;
  avgProcessingTimeMs: number;
  trendData: Array<{ date: string; analyses: number; flagged: number }>;
  verdictDistribution: Array<{ name: string; value: number; color: string }>;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  usageCount: number;
  createdAt: string;
}
