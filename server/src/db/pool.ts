import { Pool } from 'pg';
import { env, usePersistentDb } from '../config/env';

let pool: Pool | null = null;

/** Lazily-created shared connection pool. Returns null when DATABASE_URL is not configured. */
export function getPool(): Pool | null {
  if (!usePersistentDb) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    pool.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[VERIFRAME db] idle client error', err.message);
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
