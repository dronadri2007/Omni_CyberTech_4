import type { AnalysisCase, AnalysisStats, ApiKey, ReviewCase } from '../../types';

export interface CaseFilter {
  verdict?: string;
  risk?: string;
  search?: string;
  mediaType?: string;
}

/** Storage contract. Implemented by MemoryStore (default) and PgStore (when DATABASE_URL is set). */
export interface Store {
  getAllCases(filter?: CaseFilter): Promise<AnalysisCase[]>;
  getCaseById(id: string): Promise<AnalysisCase | undefined>;
  addCase(c: AnalysisCase): Promise<AnalysisCase>;
  updateCase(id: string, patch: Partial<AnalysisCase>): Promise<AnalysisCase | undefined>;
  deleteCase(id: string): Promise<boolean>;

  getAllReviews(): Promise<ReviewCase[]>;
  updateReview(idOrCaseId: string, patch: Partial<ReviewCase>): Promise<ReviewCase | undefined>;

  getStats(): Promise<AnalysisStats>;

  getApiKeys(): Promise<ApiKey[]>;
  createApiKey(name: string): Promise<ApiKey>;
}
