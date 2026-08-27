import { randomUUID } from 'crypto';
import type { Pool } from 'pg';
import type { AnalysisCase, AnalysisStats, ApiKey, ReviewCase } from '../../types';
import { CaseFilter, Store } from './types';
import { statsBaseline } from './seed';

/** PostgreSQL-backed store. Used when DATABASE_URL is set. Run `npm run db:migrate` first. */
export class PgStore implements Store {
  constructor(private readonly pool: Pool) {}

  async getAllCases(filter: CaseFilter = {}): Promise<AnalysisCase[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filter.verdict) {
      params.push(filter.verdict.toUpperCase());
      where.push(`verdict = $${params.length}`);
    }
    if (filter.risk) {
      params.push(filter.risk.toUpperCase());
      where.push(`risk_level = $${params.length}`);
    }
    if (filter.search) {
      params.push(`%${filter.search.toLowerCase()}%`);
      where.push(`(lower(id) LIKE $${params.length} OR lower(doc->>'title') LIKE $${params.length})`);
    }
    if (filter.mediaType) {
      params.push(`%${filter.mediaType.toLowerCase()}%`);
      where.push(`lower(doc#>>'{mediaFile,mimeType}') LIKE $${params.length}`);
    }
    const sql = `SELECT doc FROM analysis_case_documents ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC`;
    const { rows } = await this.pool.query<{ doc: AnalysisCase }>(sql, params);
    return rows.map((r) => r.doc);
  }

  async getCaseById(id: string): Promise<AnalysisCase | undefined> {
    const { rows } = await this.pool.query<{ doc: AnalysisCase }>('SELECT doc FROM analysis_case_documents WHERE id = $1', [id]);
    return rows[0]?.doc;
  }

  async addCase(c: AnalysisCase): Promise<AnalysisCase> {
    await this.pool.query(
      `INSERT INTO analysis_case_documents (id, user_id, verdict, risk_level, status, doc, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET doc = EXCLUDED.doc, verdict = EXCLUDED.verdict, status = EXCLUDED.status, updated_at = now()`,
      [c.id, c.userId, c.verdict, c.riskLevel, c.status, c, c.createdAt, c.updatedAt],
    );
    if (c.reviewRequired) {
      const review: ReviewCase = {
        id: `rev-${randomUUID().slice(0, 10)}`,
        caseId: c.id,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await this.pool.query(
        `INSERT INTO review_case_documents (id, case_id, status, doc, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        [review.id, review.caseId, review.status, review, review.createdAt, review.updatedAt],
      );
    }
    return c;
  }

  async updateCase(id: string, patch: Partial<AnalysisCase>): Promise<AnalysisCase | undefined> {
    const current = await this.getCaseById(id);
    if (!current) return undefined;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await this.pool.query(
      `UPDATE analysis_case_documents SET doc = $2, verdict = $3, risk_level = $4, status = $5, updated_at = now() WHERE id = $1`,
      [id, next, next.verdict, next.riskLevel, next.status],
    );
    return next;
  }

  async deleteCase(id: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM analysis_case_documents WHERE id = $1', [id]);
    await this.pool.query('DELETE FROM review_case_documents WHERE case_id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async getAllReviews(): Promise<ReviewCase[]> {
    const { rows } = await this.pool.query<{ doc: ReviewCase; case_doc: AnalysisCase | null }>(
      `SELECT r.doc AS doc, c.doc AS case_doc
         FROM review_case_documents r
         LEFT JOIN analysis_case_documents c ON c.id = r.case_id
        ORDER BY r.created_at DESC`,
    );
    return rows.map((row) => ({ ...row.doc, caseData: row.case_doc ?? row.doc.caseData }));
  }

  async updateReview(idOrCaseId: string, patch: Partial<ReviewCase>): Promise<ReviewCase | undefined> {
    const { rows } = await this.pool.query<{ doc: ReviewCase }>(
      'SELECT doc FROM review_case_documents WHERE id = $1 OR case_id = $1 LIMIT 1',
      [idOrCaseId],
    );
    const current = rows[0]?.doc;
    if (!current) return undefined;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await this.pool.query('UPDATE review_case_documents SET doc = $2, status = $3, updated_at = now() WHERE id = $1', [
      current.id,
      next,
      next.status,
    ]);
    if (patch.reviewerVerdict) {
      const parent = await this.getCaseById(current.caseId);
      if (parent) await this.updateCase(parent.id, { verdict: patch.reviewerVerdict, status: 'COMPLETED' });
    }
    return next;
  }

  async getStats(): Promise<AnalysisStats> {
    const b = statsBaseline;
    const { rows } = await this.pool.query<{ verdict: string; n: string }>(
      'SELECT verdict, count(*)::text AS n FROM analysis_case_documents GROUP BY verdict',
    );
    const by = (v: string) => Number(rows.find((r) => r.verdict === v)?.n ?? 0);
    const total = rows.reduce((a, r) => a + Number(r.n), 0);
    const { rows: rc } = await this.pool.query<{ n: string }>('SELECT count(*)::text AS n FROM review_case_documents');
    const manipulated = by('MANIPULATED') + b.manipulated;
    const suspicious = by('SUSPICIOUS') + b.suspicious;
    const authentic = by('AUTHENTIC') + b.authentic;
    const inconclusive = by('INCONCLUSIVE') + b.inconclusive;
    return {
      totalAnalyses: total + b.total,
      suspiciousCount: suspicious,
      manipulatedCount: manipulated,
      authenticCount: authentic,
      inconclusiveCount: inconclusive,
      humanReviewsCount: Number(rc[0].n) + b.reviews,
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
    const { rows } = await this.pool.query<{ doc: ApiKey }>('SELECT doc FROM api_key_documents ORDER BY created_at DESC');
    return rows.map((r) => r.doc);
  }

  async createApiKey(name: string): Promise<ApiKey> {
    const key: ApiKey = {
      id: `key-${randomUUID().slice(0, 10)}`,
      name,
      keyPrefix: `vf_live_${randomUUID().slice(0, 4)}...`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    await this.pool.query('INSERT INTO api_key_documents (id, doc, created_at) VALUES ($1,$2,$3)', [key.id, key, key.createdAt]);
    return key;
  }
}
