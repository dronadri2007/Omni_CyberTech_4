import { z } from 'zod';
import { randomUUID } from 'crypto';
import { asyncHandler } from '../middleware/errorHandler';
import { store } from '../services/store';

export const apiKeyBody = z.object({ name: z.string().min(2).max(120) });

export const getStats = asyncHandler(async (_req, res) => {
  res.status(200).json(await store.getStats());
});

export const getApiKeys = asyncHandler(async (_req, res) => {
  res.status(200).json({ keys: await store.getApiKeys() });
});

export const createApiKey = asyncHandler(async (req, res) => {
  const key = await store.createApiKey(req.body.name);
  // The full secret is shown once, here only.
  res.status(201).json({
    message: 'API key generated',
    key,
    secret: `${key.keyPrefix}${randomUUID().replace(/-/g, '')}`,
  });
});
