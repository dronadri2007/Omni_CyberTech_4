import { Request, Response } from 'express';
import { MockStore } from '../services/MockStore';

export const getStats = (req: Request, res: Response) => {
  const stats = MockStore.getStats();
  return res.status(200).json(stats);
};

export const getApiKeys = (req: Request, res: Response) => {
  const keys = MockStore.getApiKeys();
  return res.status(200).json({ keys });
};

export const createApiKey = (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'API key name is required' });
  }

  const key = MockStore.createApiKey(name);
  return res.status(201).json({
    message: 'API Key generated successfully',
    key,
    secret: `${key.keyPrefix}${Math.random().toString(36).substring(2, 18)}`
  });
};
