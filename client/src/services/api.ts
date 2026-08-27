import { AnalysisCase, AnalysisStats, ApiKey, ReviewCase, User } from '../types';

const API_BASE = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'veriframe_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || '',
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const t = tokenStore.get();
  return t ? { ...extra, Authorization: `Bearer ${t}` } : extra;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: authHeaders(init.headers as Record<string, string>) });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`) as Error & { status?: number; code?: string };
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return data as T;
}

/** Read-only fallbacks so the dashboard still renders if the API is unreachable during a demo. */
async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export const apiService = {
  // ---- auth ----
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const out = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    tokenStore.set(out.token);
    return out;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const out = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    tokenStore.set(out.token);
    return out;
  },

  async me(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  logout() {
    tokenStore.clear();
  },

  // ---- analysis (server-authoritative) ----
  async analyzeMedia(formData: FormData): Promise<{ caseId: string; result: AnalysisCase }> {
    const data = await request<{ caseId: string; result: AnalysisCase }>('/analyze', { method: 'POST', body: formData });
    return { caseId: data.caseId, result: data.result };
  },

  async getStats(): Promise<AnalysisStats> {
    return withFallback(() => request<AnalysisStats>('/stats'), FALLBACK_STATS);
  },

  async getCases(params?: { verdict?: string; risk?: string; search?: string; mediaType?: string }): Promise<{ count: number; cases: AnalysisCase[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return withFallback(
      () => request<{ count: number; cases: AnalysisCase[] }>(`/cases${query ? `?${query}` : ''}`),
      { count: DEFAULT_MOCK_CASES.length, cases: DEFAULT_MOCK_CASES },
    );
  },

  async getCaseById(caseId: string): Promise<AnalysisCase> {
    return withFallback(
      () => request<AnalysisCase>(`/cases/${caseId}`),
      DEFAULT_MOCK_CASES.find((c) => c.id === caseId) || DEFAULT_MOCK_CASES[0],
    );
  },

  async deleteCase(caseId: string): Promise<boolean> {
    try {
      await request(`/cases/${caseId}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  },

  async sendForReview(caseId: string, notes?: string): Promise<boolean> {
    try {
      await request(`/cases/${caseId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      return true;
    } catch {
      return false;
    }
  },

  async getReviews(): Promise<{ count: number; reviews: ReviewCase[] }> {
    return withFallback(() => request<{ count: number; reviews: ReviewCase[] }>('/reviews'), {
      count: 1,
      reviews: [
        {
          id: 'rev-001',
          caseId: 'VF-2026-000125',
          caseData: DEFAULT_MOCK_CASES[1],
          reviewerName: 'Dr. Sarah Vance',
          status: 'IN_REVIEW',
          reviewerVerdict: 'SUSPICIOUS',
          notes: 'Secondary landmark spatial density check requested.',
          createdAt: '2026-08-21T09:30:00Z',
          updatedAt: '2026-08-21T09:30:00Z',
        },
      ],
    });
  },

  async updateReview(id: string, updates: Partial<ReviewCase>): Promise<boolean> {
    try {
      await request(`/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return true;
    } catch {
      return false;
    }
  },

  async getReport(caseId: string): Promise<unknown> {
    return withFallback(
      () => request<unknown>(`/reports/${caseId}`),
      (() => {
        const item = DEFAULT_MOCK_CASES.find((c) => c.id === caseId) || DEFAULT_MOCK_CASES[0];
        return {
          reportId: `REP-${item.id}`,
          platform: 'VERIFRAME Multimodal Media Verification SOC',
          generatedAt: new Date().toISOString(),
          caseSummary: item,
          disclaimer: 'VERIFRAME analysis is an AI-assisted probabilistic evaluation.',
        };
      })(),
    );
  },

  async getApiKeys(): Promise<{ keys: ApiKey[] }> {
    return withFallback(() => request<{ keys: ApiKey[] }>('/keys'), {
      keys: [{ id: 'key-001', name: 'Production FactCheck Bot', keyPrefix: 'vf_live_9a8f...', usageCount: 1420, createdAt: '2026-05-10T12:00:00Z' }],
    });
  },

  async createApiKey(name: string): Promise<{ key: ApiKey; secret: string }> {
    return request<{ key: ApiKey; secret: string }>('/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  },
};

const FALLBACK_STATS: AnalysisStats = {
  totalAnalyses: 2481,
  suspiciousCount: 342,
  manipulatedCount: 289,
  authenticCount: 1827,
  inconclusiveCount: 23,
  humanReviewsCount: 38,
  avgProcessingTimeMs: 1420,
  trendData: [
    { date: 'Aug 20', analyses: 210, flagged: 32 },
    { date: 'Aug 21', analyses: 340, flagged: 54 },
    { date: 'Aug 22', analyses: 290, flagged: 41 },
    { date: 'Aug 23', analyses: 410, flagged: 78 },
    { date: 'Aug 24', analyses: 380, flagged: 62 },
    { date: 'Aug 25', analyses: 510, flagged: 95 },
    { date: 'Aug 26', analyses: 341, flagged: 48 },
  ],
  verdictDistribution: [
    { name: 'Authentic', value: 1827, color: '#10b981' },
    { name: 'Manipulated', value: 289, color: '#ef4444' },
    { name: 'Suspicious', value: 342, color: '#f59e0b' },
    { name: 'Inconclusive', value: 23, color: '#6b7280' },
  ],
};

// Offline demo fixtures — only used by read paths when the API is unreachable.
export const DEFAULT_MOCK_CASES: AnalysisCase[] = [
  {
    id: 'VF-2026-000124',
    userId: 'usr-demo-001',
    mediaId: 'med-001',
    title: 'Political Address Video Segment.mp4',
    verdict: 'MANIPULATED',
    confidence: 91,
    authenticityScore: 9,
    manipulationProbability: 91,
    riskLevel: 'HIGH',
    status: 'COMPLETED',
    reviewRequired: true,
    mediaFile: {
      id: 'med-001',
      filename: 'press_conference_deepfake.mp4',
      mimeType: 'video/mp4',
      sizeBytes: 18452000,
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      storageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      createdAt: '2026-08-20T14:32:00Z',
    },
    detectionResults: {
      id: 'det-001',
      caseId: 'VF-2026-000124',
      faceForgeryScore: 94,
      temporalScore: 88,
      audioVisualScore: 86,
      metadataScore: 75,
      provenanceStatus: 'NOT_VERIFIED',
      modelVersion: 'v2.4-ensemble-deepfake',
      reasoningHighlights: [
        'Facial landmark jitter detected across frames 120 through 240.',
        'Audio pitch spectral anomaly detected around 4.2 seconds into recording.',
        'C2PA cryptographic signature missing or corrupted in file header.',
      ],
      heatmapMatrix: [
        [0.1, 0.2, 0.8, 0.9, 0.3],
        [0.1, 0.7, 0.95, 0.85, 0.2],
        [0.2, 0.9, 0.99, 0.9, 0.3],
        [0.1, 0.6, 0.8, 0.7, 0.2],
        [0.0, 0.1, 0.3, 0.2, 0.1],
      ],
      timelineAnomalies: [
        { timestampSec: 1.4, score: 0.72, label: 'Blinking frequency anomaly' },
        { timestampSec: 3.8, score: 0.94, label: 'Facial boundary warping' },
        { timestampSec: 4.2, score: 0.89, label: 'Lip-sync asynchronous delay (140ms)' },
      ],
      createdAt: '2026-08-20T14:32:15Z',
    },
    provenanceDetails: {
      id: 'prov-001',
      caseId: 'VF-2026-000124',
      c2paValid: false,
      issuer: 'Unknown Manifest',
      cameraMake: 'Generic Virtual Device',
      cameraModel: 'OBS-VirtualCam-v2',
      softwareHistory: ['FFmpeg 4.4.1', 'Adobe After Effects 2024 (Macintosh)'],
      exifData: { Format: 'MPEG-4', Encoder: 'Lavf58.76.100', Duration: '00:00:12.40' },
      chainOfCustody: [
        { timestamp: '2026-08-20T12:00:00Z', action: 'Uploaded to Social Network X', actor: 'Anonymous Handle' },
        { timestamp: '2026-08-20T14:32:00Z', action: 'Ingested into VERIFRAME SOC', actor: 'Dr. Sarah Vance' },
      ],
    },
    createdAt: '2026-08-20T14:32:00Z',
    updatedAt: '2026-08-20T14:32:15Z',
  },
  {
    id: 'VF-2026-000125',
    userId: 'usr-demo-001',
    mediaId: 'med-002',
    title: 'Profile Photo Submission #8812.jpg',
    verdict: 'SUSPICIOUS',
    confidence: 78,
    authenticityScore: 22,
    manipulationProbability: 78,
    riskLevel: 'MEDIUM',
    status: 'IN_REVIEW',
    reviewRequired: true,
    mediaFile: {
      id: 'med-002',
      filename: 'synthetic_portrait.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 2450100,
      fileHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      storageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
      createdAt: '2026-08-21T09:15:00Z',
    },
    detectionResults: {
      id: 'det-002',
      caseId: 'VF-2026-000125',
      faceForgeryScore: 82,
      temporalScore: 45,
      audioVisualScore: 0,
      metadataScore: 85,
      provenanceStatus: 'SUSPICIOUS',
      modelVersion: 'v2.4-ensemble-deepfake',
      reasoningHighlights: [
        'Diffusion noise spectrum matches Midjourney v6 / Stable Diffusion pattern.',
        'Asymmetric pupil reflection caught under high-resolution spectral inspection.',
        'EXIF creation timestamp differs from internal compression header.',
      ],
      heatmapMatrix: [
        [0.1, 0.2, 0.3, 0.2, 0.1],
        [0.2, 0.85, 0.9, 0.8, 0.2],
        [0.1, 0.7, 0.95, 0.75, 0.1],
        [0.1, 0.4, 0.5, 0.4, 0.1],
        [0.0, 0.1, 0.2, 0.1, 0.0],
      ],
      createdAt: '2026-08-21T09:15:10Z',
    },
    provenanceDetails: {
      id: 'prov-002',
      caseId: 'VF-2026-000125',
      c2paValid: false,
      issuer: 'Unsigned Local Export',
      cameraMake: 'Apple',
      cameraModel: 'iPhone 15 Pro (Forged EXIF Header)',
      softwareHistory: ['Adobe Photoshop 25.1 (Windows)'],
      exifData: { Make: 'Apple', Model: 'iPhone 15 Pro', ISO: '100', Software: 'Photoshop 2024' },
    },
    createdAt: '2026-08-21T09:15:00Z',
    updatedAt: '2026-08-21T09:15:10Z',
  },
  {
    id: 'VF-2026-000126',
    userId: 'usr-demo-002',
    mediaId: 'med-003',
    title: 'Wire Transfer Audio Instructions.wav',
    verdict: 'INCONCLUSIVE',
    confidence: 54,
    authenticityScore: 46,
    manipulationProbability: 54,
    riskLevel: 'MEDIUM',
    status: 'COMPLETED',
    reviewRequired: false,
    mediaFile: {
      id: 'med-003',
      filename: 'executive_voice_clone.wav',
      mimeType: 'audio/wav',
      sizeBytes: 4120000,
      fileHash: '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eee7935b20cb',
      storageUrl: 'https://actions.google.com/sounds/v1/ambiences/office_noise.ogg',
      createdAt: '2026-08-22T11:40:00Z',
    },
    detectionResults: {
      id: 'det-003',
      caseId: 'VF-2026-000126',
      faceForgeryScore: 0,
      temporalScore: 20,
      audioVisualScore: 68,
      metadataScore: 40,
      provenanceStatus: 'UNAVAILABLE',
      modelVersion: 'v2.4-ensemble-deepfake',
      reasoningHighlights: [
        'High ambient background noise reduces neural vocoder detection certainty below 80%.',
        'Sharp frequency cutoff at 8kHz indicates GSM cell phone codec compression.',
      ],
      waveformSegments: [
        { startTimeSec: 0.5, endTimeSec: 2.1, anomalyScore: 0.42, label: 'Natural speech breathing' },
        { startTimeSec: 3.2, endTimeSec: 5.8, anomalyScore: 0.61, label: 'Possible ElevenLabs synthetic artifact' },
      ],
      createdAt: '2026-08-22T11:40:12Z',
    },
    provenanceDetails: {
      id: 'prov-003',
      caseId: 'VF-2026-000126',
      c2paValid: false,
      softwareHistory: ['VoIP Recording Engine'],
      exifData: { AudioCodec: 'PCM 16-bit', SampleRate: '44100 Hz', Channels: 'Mono' },
    },
    createdAt: '2026-08-22T11:40:00Z',
    updatedAt: '2026-08-22T11:40:12Z',
  },
  {
    id: 'VF-2026-000127',
    userId: 'usr-demo-002',
    mediaId: 'med-004',
    title: 'Field Report Photo #401.png',
    verdict: 'AUTHENTIC',
    confidence: 96,
    authenticityScore: 96,
    manipulationProbability: 4,
    riskLevel: 'LOW',
    status: 'COMPLETED',
    reviewRequired: false,
    mediaFile: {
      id: 'med-004',
      filename: 'verified_news_photo.png',
      mimeType: 'image/png',
      sizeBytes: 5120000,
      fileHash: '7b257a07746487e411b012356c54c30c80b6f9f257f864e26217e54f0a0d922f',
      storageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      createdAt: '2026-08-23T16:10:00Z',
    },
    detectionResults: {
      id: 'det-004',
      caseId: 'VF-2026-000127',
      faceForgeryScore: 4,
      temporalScore: 3,
      audioVisualScore: 2,
      metadataScore: 98,
      provenanceStatus: 'VERIFIED',
      modelVersion: 'v2.4-ensemble-deepfake',
      reasoningHighlights: [
        'Hardware C2PA certificate cryptographically verified (Sony Alpha Security PKI).',
        'Camera sensor Bayer pattern noise profile perfectly consistent across high-contrast areas.',
      ],
      heatmapMatrix: [
        [0.02, 0.01, 0.03, 0.02, 0.01],
        [0.01, 0.04, 0.05, 0.03, 0.02],
        [0.02, 0.03, 0.04, 0.03, 0.01],
        [0.01, 0.02, 0.03, 0.02, 0.01],
        [0.01, 0.01, 0.02, 0.01, 0.0],
      ],
      createdAt: '2026-08-23T16:10:14Z',
    },
    provenanceDetails: {
      id: 'prov-004',
      caseId: 'VF-2026-000127',
      c2paValid: true,
      issuer: 'Sony Alpha Security Authority',
      signatureTimestamp: '2026-08-23T15:58:12Z',
      cameraMake: 'Sony',
      cameraModel: 'ILCE-7M4 (Alpha 7 IV)',
      softwareHistory: ['Sony Hardware Firmware v2.00'],
      exifData: { Make: 'Sony', Model: 'ILCE-7M4', ExposureTime: '1/500 sec', FNumber: 'f/2.8', ISO: '400' },
      chainOfCustody: [
        { timestamp: '2026-08-23T15:58:12Z', action: 'Captured on Device with C2PA hardware seal', actor: 'Associated Press Journalist' },
        { timestamp: '2026-08-23T16:10:00Z', action: 'Submitted to VERIFRAME Integrity Platform', actor: 'Alex Mercer' },
      ],
    },
    createdAt: '2026-08-23T16:10:00Z',
    updatedAt: '2026-08-23T16:10:14Z',
  },
];
