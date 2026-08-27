import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from the repo root as well as the server directory.
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  // A weak fallback is allowed only outside production so the demo runs with zero config.
  JWT_SECRET: z.string().min(1).default('veriframe-dev-only-insecure-secret'),
  JWT_EXPIRES_IN: z.string().default('12h'),

  DATABASE_URL: z.string().url().optional(),

  // forensic = real no-ML analysis, mock = deterministic demo, pytorch = remote model service
  ANALYZER: z.enum(['forensic', 'mock', 'pytorch']).default('forensic'),
  AI_ENGINE_SERVICE_URL: z.string().url().default('http://localhost:8000/v1/inference'),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(50),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('[VERIFRAME] Invalid environment configuration:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';

if (isProd && env.JWT_SECRET === 'veriframe-dev-only-insecure-secret') {
  // eslint-disable-next-line no-console
  console.error('[VERIFRAME] JWT_SECRET must be set to a strong value in production.');
  process.exit(1);
}

export const corsOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
export const usePersistentDb = Boolean(env.DATABASE_URL);
