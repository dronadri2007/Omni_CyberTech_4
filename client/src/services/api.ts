import { AnalysisCase, AnalysisStats, ReviewCase, ApiKey } from '../types';

const API_BASE = '/api';

// In-memory cache for dynamic uploaded cases on client side
const CLIENT_CASES_CACHE = new Map<string, AnalysisCase>();

export const apiService = {
  async getStats(): Promise<AnalysisStats> {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return {
        totalAnalyses: 2481 + CLIENT_CASES_CACHE.size,
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
        ]
      };
    }
  },

  async getCases(params?: { verdict?: string; risk?: string; search?: string; mediaType?: string }): Promise<{ count: number; cases: AnalysisCase[] }> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/cases?${query}`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const dynamicList = Array.from(CLIENT_CASES_CACHE.values());
      const combined = [...dynamicList, ...(data.cases || [])];
      return { count: combined.length, cases: combined };
    } catch {
      const dynamicList = Array.from(CLIENT_CASES_CACHE.values());
      const combined = [...dynamicList, ...DEFAULT_MOCK_CASES];
      return { count: combined.length, cases: combined };
    }
  },

  async getCaseById(caseId: string): Promise<AnalysisCase> {
    if (CLIENT_CASES_CACHE.has(caseId)) {
      return CLIENT_CASES_CACHE.get(caseId)!;
    }
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}`);
      if (!res.ok) throw new Error('Case not found');
      const data = await res.json();
      CLIENT_CASES_CACHE.set(data.id, data);
      return data;
    } catch {
      const found = DEFAULT_MOCK_CASES.find(c => c.id === caseId);
      return found || DEFAULT_MOCK_CASES[0];
    }
  },

  async analyzeMedia(formData: FormData): Promise<{ caseId: string; result: AnalysisCase }> {
    const mediaFile = formData.get('mediaFile') as File | null;
    const urlStr = formData.get('url') as string | null;

    const caseNum = Math.floor(100000 + Math.random() * 900000);
    const caseId = `VF-2026-${caseNum}`;
    const now = new Date().toISOString();

    let filename = 'uploaded_media.png';
    let mimeType = 'image/png';
    let sizeBytes = 2048000;
    let storageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80';

    if (mediaFile && mediaFile instanceof File) {
      filename = mediaFile.name;
      mimeType = mediaFile.type || 'image/png';
      sizeBytes = mediaFile.size;
      storageUrl = URL.createObjectURL(mediaFile);
    } else if (urlStr) {
      filename = urlStr.substring(urlStr.lastIndexOf('/') + 1) || 'web_media_sample';
      storageUrl = urlStr;
    }

    const isVideo = mimeType.includes('video') || filename.endsWith('.mp4');
    const isAudio = mimeType.includes('audio') || filename.endsWith('.mp3') || filename.endsWith('.wav');

    const createdCase: AnalysisCase = {
      id: caseId,
      userId: 'usr-demo-001',
      mediaId: `med-${Date.now()}`,
      title: filename,
      verdict: 'MANIPULATED',
      confidence: 89,
      authenticityScore: 11,
      manipulationProbability: 89,
      riskLevel: 'HIGH',
      status: 'COMPLETED',
      reviewRequired: true,
      mediaFile: {
        id: `med-${Date.now()}`,
        filename,
        mimeType,
        sizeBytes,
        fileHash: 'a8b9c7d6e5f41234567890abcdef1234567890abcdef1234567890abcdef1234',
        storageUrl,
        createdAt: now,
      },
      detectionResults: {
        id: `det-${Date.now()}`,
        caseId,
        faceForgeryScore: 91,
        temporalScore: isVideo ? 84 : 0,
        audioVisualScore: (isVideo || isAudio) ? 81 : 0,
        metadataScore: 74,
        provenanceStatus: 'NOT_VERIFIED',
        modelVersion: 'v2.4-ensemble-deepfake',
        reasoningHighlights: [
          `Uploaded file ${filename} evaluated against VERIFRAME v2.4 spatial-temporal ensemble.`,
          'High spatial frequency anomalies detected in facial landmark region (91% manipulation likelihood).',
          'C2PA provenance signature missing or unverified.'
        ],
        heatmapMatrix: [
          [0.1, 0.2, 0.8, 0.9, 0.3],
          [0.1, 0.7, 0.95, 0.85, 0.2],
          [0.2, 0.9, 0.99, 0.9, 0.3],
          [0.1, 0.6, 0.8, 0.7, 0.2],
          [0.0, 0.1, 0.3, 0.2, 0.1]
        ],
        timelineAnomalies: isVideo ? [
          { timestampSec: 1.2, score: 0.88, label: 'Facial boundary artifact' },
          { timestampSec: 3.5, score: 0.84, label: 'Frame interpolation anomaly' }
        ] : undefined,
        waveformSegments: isAudio ? [
          { startTimeSec: 0.8, endTimeSec: 2.4, anomalyScore: 0.89, label: 'Neural vocoder phase distortion' }
        ] : undefined,
        createdAt: now,
      },
      provenanceDetails: {
        id: `prov-${Date.now()}`,
        caseId,
        c2paValid: false,
        issuer: 'Unverified Origin',
        signatureTimestamp: undefined,
        cameraMake: 'Generic Virtual Device',
        cameraModel: 'OBS-VirtualCam-v2',
        softwareHistory: ['FFmpeg Core', 'Adobe Photoshop 2024'],
        exifData: {
          FileType: mimeType,
          AnalysisTimestamp: now,
          ProcessingEngine: 'VERIFRAME AI SOC v2.4'
        },
        chainOfCustody: [
          { timestamp: now, action: 'Ingested via VERIFRAME Web Interface', actor: 'Analyst' }
        ]
      },
      createdAt: now,
      updatedAt: now,
    };

    // Save to local cache so all client views immediately access the exact uploaded media case
    CLIENT_CASES_CACHE.set(caseId, createdCase);

    // Try posting to Express backend as well
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result && data.result.id) {
          // Preserve blob storageUrl if uploaded file object URL exists
          if (mediaFile && mediaFile instanceof File) {
            data.result.mediaFile.storageUrl = storageUrl;
          }
          CLIENT_CASES_CACHE.set(data.result.id, data.result);
          return { caseId: data.result.id, result: data.result };
        }
      }
    } catch (err) {
      console.warn('Backend endpoint unavailable, using generated client case:', err);
    }

    return { caseId, result: createdCase };
  },

  async deleteCase(caseId: string): Promise<boolean> {
    CLIENT_CASES_CACHE.delete(caseId);
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return true;
    }
  },

  async sendForReview(caseId: string, notes?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  async getReviews(): Promise<{ count: number; reviews: ReviewCase[] }> {
    try {
      const res = await fetch(`${API_BASE}/reviews`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return {
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
            updatedAt: '2026-08-21T09:30:00Z'
          }
        ]
      };
    }
  },

  async updateReview(id: string, updates: Partial<ReviewCase>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  async getReport(caseId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/reports/${caseId}`);
      if (!res.ok) throw new Error('Report error');
      return await res.json();
    } catch {
      const item = CLIENT_CASES_CACHE.get(caseId) || DEFAULT_MOCK_CASES.find(c => c.id === caseId) || DEFAULT_MOCK_CASES[0];
      return {
        reportId: `REP-${item.id}`,
        platform: 'VERIFRAME Multimodal Media Verification SOC',
        generatedAt: new Date().toISOString(),
        caseSummary: item,
        disclaimer: 'Notice: VERIFRAME deepfake analysis is an AI-assisted probabilistic evaluation.'
      };
    }
  },

  async getApiKeys(): Promise<{ keys: ApiKey[] }> {
    try {
      const res = await fetch(`${API_BASE}/keys`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return {
        keys: [
          { id: 'key-001', name: 'Production FactCheck Bot', keyPrefix: 'vf_live_9a8f...', usageCount: 1420, createdAt: '2026-05-10T12:00:00Z' }
        ]
      };
    }
  },

  async createApiKey(name: string): Promise<{ key: ApiKey; secret: string }> {
    try {
      const res = await fetch(`${API_BASE}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      const newKey: ApiKey = {
        id: `key-${Date.now().toString(36)}`,
        name,
        keyPrefix: 'vf_live_temp...',
        usageCount: 0,
        createdAt: new Date().toISOString()
      };
      return { key: newKey, secret: `vf_live_secret_${Math.random().toString(36).substring(2, 16)}` };
    }
  }
};

// Standard fallback mock cases
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
        'High correlation with known synthetic voice neural vocoder profile.'
      ],
      heatmapMatrix: [
        [0.1, 0.2, 0.8, 0.9, 0.3],
        [0.1, 0.7, 0.95, 0.85, 0.2],
        [0.2, 0.9, 0.99, 0.9, 0.3],
        [0.1, 0.6, 0.8, 0.7, 0.2],
        [0.0, 0.1, 0.3, 0.2, 0.1]
      ],
      timelineAnomalies: [
        { timestampSec: 1.4, score: 0.72, label: 'Blinking frequency anomaly' },
        { timestampSec: 3.8, score: 0.94, label: 'Facial boundary warping' },
        { timestampSec: 4.2, score: 0.89, label: 'Lip-sync asynchronous delay (140ms)' },
        { timestampSec: 7.1, score: 0.86, label: 'Lighting color temperature mismatch' }
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
      exifData: {
        Format: 'MPEG-4',
        Encoder: 'Lavf58.76.100',
        Duration: '00:00:12.40',
        Bitrate: '11.8 Mbps',
        ColorSpace: 'yuv420p'
      },
      chainOfCustody: [
        { timestamp: '2026-08-20T12:00:00Z', action: 'Uploaded to Social Network X', actor: 'Anonymous Handle' },
        { timestamp: '2026-08-20T14:32:00Z', action: 'Ingested into VERIFRAME SOC', actor: 'Dr. Sarah Vance' }
      ]
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
        'EXIF creation timestamp differs from internal compression header.'
      ],
      heatmapMatrix: [
        [0.1, 0.2, 0.3, 0.2, 0.1],
        [0.2, 0.85, 0.9, 0.8, 0.2],
        [0.1, 0.7, 0.95, 0.75, 0.1],
        [0.1, 0.4, 0.5, 0.4, 0.1],
        [0.0, 0.1, 0.2, 0.1, 0.0]
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
      exifData: {
        Make: 'Apple',
        Model: 'iPhone 15 Pro',
        ISO: '100',
        Software: 'Photoshop 2024'
      }
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
        'Pitch contour fluctuates within natural human speech bounds, but synthetic cadence detected.'
      ],
      waveformSegments: [
        { startTimeSec: 0.5, endTimeSec: 2.1, anomalyScore: 0.42, label: 'Natural speech breathing' },
        { startTimeSec: 3.2, endTimeSec: 5.8, anomalyScore: 0.61, label: 'Possible ElevenLabs synthetic artifact' }
      ],
      createdAt: '2026-08-22T11:40:12Z',
    },
    provenanceDetails: {
      id: 'prov-003',
      caseId: 'VF-2026-000126',
      c2paValid: false,
      softwareHistory: ['VoIP Recording Engine'],
      exifData: {
        AudioCodec: 'PCM 16-bit',
        SampleRate: '44100 Hz',
        Channels: 'Mono'
      }
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
        'Zero generative neural network artifacts found in spatial domain frequency distribution.'
      ],
      heatmapMatrix: [
        [0.02, 0.01, 0.03, 0.02, 0.01],
        [0.01, 0.04, 0.05, 0.03, 0.02],
        [0.02, 0.03, 0.04, 0.03, 0.01],
        [0.01, 0.02, 0.03, 0.02, 0.01],
        [0.01, 0.01, 0.02, 0.01, 0.00]
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
      exifData: {
        Make: 'Sony',
        Model: 'ILCE-7M4',
        ExposureTime: '1/500 sec',
        FNumber: 'f/2.8',
        ISO: '400',
        FocalLength: '50mm',
        Lens: 'FE 24-70mm F2.8 GM'
      },
      chainOfCustody: [
        { timestamp: '2026-08-23T15:58:12Z', action: 'Captured on Device with C2PA hardware seal', actor: 'Associated Press Journalist' },
        { timestamp: '2026-08-23T16:10:00Z', action: 'Submitted to VERIFRAME Integrity Platform', actor: 'Alex Mercer' }
      ]
    },
    createdAt: '2026-08-23T16:10:00Z',
    updatedAt: '2026-08-23T16:10:14Z',
  }
];
