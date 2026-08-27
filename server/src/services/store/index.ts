import { getPool } from '../../db/pool';
import { MemoryStore } from './MemoryStore';
import { PgStore } from './PgStore';
import type { Store } from './types';

export type { Store, CaseFilter } from './types';

const pool = getPool();

/** The active store: PgStore when DATABASE_URL is configured, otherwise the in-memory store. */
export const store: Store = pool ? new PgStore(pool) : new MemoryStore();
