import { randomUUID } from 'crypto';
import type { AnalysisCase, AnalysisStats, ApiKey, ReviewCase } from '../../types';
import { CaseFilter, Store } from './types';
import { seedApiKeys, seedCases, seedReviews, statsBaseline } from './seed';

function matches(c: AnalysisCase, f: CaseFilter): boolean {
  if (f.verdict && c.verdict.toLowerCase() !== f.verdict.toLowerCase()) return false;
  if (f.risk && c.riskLevel.toLowerCase() !== f.risk.toLowerCase()) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    if (!c.id.toLowerCase().includes(q) && !c.title.toLowerCase().includes(q)) return false;
  }
  if (f.mediaType) {
    const t = f.mediaType.toLowerCase();
    const mime = c.mediaFile.mimeType.toLowerCase();
    if (t === 'image' && !mime.includes('image')) return false;
    if (t === 'video' && !mime.includes('video')) return false;
    if (t === 'audio' && !mime.includes('audio')) return false;
  }
  return true;
}

/** In-memory store. Pre-seeded, non-persistent — resets on restart. Default when DATABASE_URL is unset. */
export class MemoryStore implements Store {
  private cases: AnalysisCase[] = seedCases.map((c) => structuredClone(c));
  private reviews: ReviewCase[] = seedReviews.map((r) => structuredClone(r));
  private apiKeys: ApiKey[] = seedApiKeys.map((k) => structuredClone(k));

  async getAllCases(filter: CaseFilter = {}): Promise<AnalysisCase[]> {
    return this.cases.filter((c) => matches(c, filter));
  }

  async getCaseById(id: string): Promise<AnalysisCase | undefined> {
    return this.cases.find((c) => c.id === id);
  }

  async addCase(c: AnalysisCase): Promise<AnalysisCase> {
    this.cases.unshift(c);
    if (c.reviewRequired) {
      this.reviews.unshift({
        id: `rev-${randomUUID().slice(0, 10)}`,
        caseId: c.id,
        caseData: c,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return c;
  }

  async updateCase(id: string, patch: Partial<AnalysisCase>): Promise<AnalysisCase | undefined> {
    const idx = this.cases.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.cases[idx] = { ...this.cases[idx], ...patch, updatedAt: new Date().toISOString() };
    return this.cases[idx];
  }

  async deleteCase(id: string): Promise<boolean> {
    const before = this.cases.length;
    this.cases = this.cases.filter((c) => c.id !== id);
    this.reviews = this.reviews.filter((r) => r.caseId !== id);
    return this.cases.length < before;
  }

  async getAllReviews(): Promise<ReviewCase[]> {
    return this.reviews.map((r) => ({ ...r, caseData: this.cases.find((c) => c.id === r.caseId) ?? r.caseData }));
  }

  async updateReview(idOrCaseId: string, patch: Partial<ReviewCase>): Promise<ReviewCase | undefined> {
    const idx = this.reviews.findIndex((r) => r.id === idOrCaseId || r.caseId === idOrCaseId);
    if (idx === -1) return undefined;
    this.reviews[idx] = { ...this.reviews[idx], ...patch, updatedAt: new Date().toISOString() };
    if (patch.reviewerVerdict) {
      const parent = this.cases.find((c) => c.id === this.reviews[idx].caseId);
      if (parent) {
        parent.verdict = patch.reviewerVerdict;
        parent.status = 'COMPLETED';
        parent.updatedAt = new Date().toISOString();
      }
    }
    return this.reviews[idx];
  }

  async getStats(): Promise<AnalysisStats> {
    const b = statsBaseline;
    const manipulated = this.cases.filter((c) => c.verdict === 'MANIPULATED').length + b.manipulated;
    const suspicious = this.cases.filter((c) => c.verdict === 'SUSPICIOUS').length + b.suspicious;
    const authentic = this.cases.filter((c) => c.verdict === 'AUTHENTIC').length + b.authentic;
    const inconclusive = this.cases.filter((c) => c.verdict === 'INCONCLUSIVE').length + b.inconclusive;
    return {
      totalAnalyses: this.cases.length + b.total,
      suspiciousCount: suspicious,
      manipulatedCount: manipulated,
      authenticCount: authentic,
      inconclusiveCount: inconclusive,
      humanReviewsCount: this.reviews.length + b.reviews,
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
        { name: 'Authentic', value: authentic, color: '#10b981' },
        { name: 'Manipulated', value: manipulated, color: '#ef4444' },
        { name: 'Suspicious', value: suspicious, color: '#f59e0b' },
        { name: 'Inconclusive', value: inconclusive, color: '#6b7280' },
      ],
    };
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return this.apiKeys;
  }

  async createApiKey(name: string): Promise<ApiKey> {
    const key: ApiKey = {
      id: `key-${randomUUID().slice(0, 10)}`,
      name,
      keyPrefix: `vf_live_${randomUUID().slice(0, 4)}...`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.apiKeys.push(key);
    return key;
  }
}
