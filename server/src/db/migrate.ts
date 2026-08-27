import fs from 'fs';
import path from 'path';
import { getPool } from './pool';
import { seedApiKeys, seedCases, seedReviews } from '../services/store/seed';

const DB_DIR = path.resolve(__dirname, '../../../database');

async function run() {
  const pool = getPool();
  if (!pool) {
    // eslint-disable-next-line no-console
    console.error('DATABASE_URL is not set — nothing to migrate.');
    process.exit(1);
  }

  const files = [
    path.join(DB_DIR, 'schema.sql'),
    ...fs
      .readdirSync(path.join(DB_DIR, 'migrations'))
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .map((f) => path.join(DB_DIR, 'migrations', f)),
  ].filter((f) => fs.existsSync(f));

  for (const file of files) {
    const sql = fs.readFileSync(file, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`→ applying ${path.relative(DB_DIR, file)}`);
    await pool.query(sql);
  }

  // Seed demo data only when empty.
  const { rows } = await pool.query<{ count: string }>('SELECT count(*)::text FROM analysis_case_documents');
  if (Number(rows[0].count) === 0) {
    // eslint-disable-next-line no-console
    console.log('→ seeding demo cases');
    for (const c of seedCases) {
      await pool.query(
        `INSERT INTO analysis_case_documents (id, user_id, verdict, risk_level, status, doc, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [c.id, c.userId, c.verdict, c.riskLevel, c.status, c, c.createdAt, c.updatedAt],
      );
    }
    for (const r of seedReviews) {
      await pool.query(
        `INSERT INTO review_case_documents (id, case_id, status, doc, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [r.id, r.caseId, r.status, r, r.createdAt, r.updatedAt],
      );
    }
    for (const k of seedApiKeys) {
      await pool.query(`INSERT INTO api_key_documents (id, doc, created_at) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`, [
        k.id,
        k,
        k.createdAt,
      ]);
    }
  }

  // eslint-disable-next-line no-console
  console.log('✔ migrations complete');
  await pool.end();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('migration failed:', err);
  process.exit(1);
});
