import { NextFunction, Request, RequestHandler, Response } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { isProd } from '../config/env';

/** Wrap an async route handler so rejected promises reach the error handler. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'ERR_NOT_FOUND' });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, code: err.code, details: err.details });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', code: 'ERR_VALIDATION', details: err.flatten() });
  }
  if (err instanceof MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: err.message, code: `ERR_UPLOAD_${err.code}` });
  }

  // eslint-disable-next-line no-console
  console.error('[VERIFRAME Server Error]:', err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return res.status(500).json({
    error: isProd ? 'Internal Server Error' : message,
    code: 'ERR_INTERNAL',
  });
};
