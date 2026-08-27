import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { photoJpeg } from './fixtures';

let token = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alex.mercer@cybersec.io', password: 'veriframe-demo' });
  token = res.body.token;
});

describe('health & cases', () => {
  it('reports the active analyzer and store', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ONLINE', analyzer: 'forensic', store: 'memory' });
  });

  it('lists seeded cases and fetches one by id', async () => {
    const list = await request(app).get('/api/cases');
    expect(list.status).toBe(200);
    expect(list.body.count).toBeGreaterThanOrEqual(4);

    const one = await request(app).get('/api/cases/VF-2026-000124');
    expect(one.status).toBe(200);
    expect(one.body.verdict).toBe('MANIPULATED');
  });

  it('404s an unknown case', async () => {
    const res = await request(app).get('/api/cases/VF-2026-999999');
    expect(res.status).toBe(404);
  });

  it('filters cases by verdict', async () => {
    const res = await request(app).get('/api/cases?verdict=authentic');
    expect(res.status).toBe(200);
    expect(res.body.cases.every((c: { verdict: string }) => c.verdict === 'AUTHENTIC')).toBe(true);
  });
});

describe('analyze (auth + forensic engine)', () => {
  it('rejects an unauthenticated analyze request', async () => {
    const res = await request(app).post('/api/analyze').attach('mediaFile', await photoJpeg(), 'p.jpg');
    expect(res.status).toBe(401);
  });

  it('runs real forensic analysis on an uploaded image', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('authorization', `Bearer ${token}`)
      .attach('mediaFile', await photoJpeg(), 'sample.jpg');

    expect(res.status).toBe(200);
    const r = res.body.result;
    expect(r.id).toMatch(/^VF-2026-\d{6}$/);
    expect(['AUTHENTIC', 'SUSPICIOUS', 'MANIPULATED', 'INCONCLUSIVE']).toContain(r.verdict);
    expect(r.detectionResults.modelVersion).toBe('forensic-v1-noml');
    // ELA produced a real 8x8 heatmap.
    expect(r.detectionResults.heatmapMatrix).toHaveLength(8);
    expect(r.detectionResults.heatmapMatrix[0]).toHaveLength(8);
    expect(r.detectionResults.reasoningHighlights.length).toBeGreaterThan(0);
    expect(r.mediaFile.fileHash).toMatch(/^[a-f0-9]{64}$/);

    // The new case is queryable.
    const fetched = await request(app).get(`/api/cases/${r.id}`);
    expect(fetched.status).toBe(200);
  });

  it('rejects a non-media upload', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('authorization', `Bearer ${token}`)
      .attach('mediaFile', Buffer.from('not media'), 'x.txt');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('requires a file or url', async () => {
    const res = await request(app).post('/api/analyze').set('authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

describe('review queue', () => {
  it('requires auth to read the queue', async () => {
    expect((await request(app).get('/api/reviews')).status).toBe(401);
  });

  it('lets an authed reviewer override a verdict', async () => {
    const res = await request(app)
      .patch('/api/reviews/rev-001')
      .set('authorization', `Bearer ${token}`)
      .send({ reviewerVerdict: 'MANIPULATED', status: 'OVERRIDDEN' });
    expect(res.status).toBe(200);

    const parent = await request(app).get('/api/cases/VF-2026-000125');
    expect(parent.body.verdict).toBe('MANIPULATED');
  });
});
