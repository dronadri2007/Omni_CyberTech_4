import { RequestHandler } from 'express';
import { authService, JwtClaims } from '../services/authService';
import { AppError } from '../utils/AppError';
import type { User } from '../types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: JwtClaims;
    }
  }
}

function extractToken(header?: string): string | undefined {
  if (!header) return undefined;
  const [scheme, value] = header.split(' ');
  if (scheme?.toLowerCase() === 'bearer' && value) return value.trim();
  return undefined;
}

/** Require a valid Bearer token; attaches `req.auth`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req.header('authorization'));
  if (!token) return next(AppError.unauthorized());
  try {
    req.auth = authService.verify(token);
    next();
  } catch (err) {
    next(err);
  }
};

/** Attach `req.auth` when a valid token is present, but never reject. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req.header('authorization'));
  if (token) {
    try {
      req.auth = authService.verify(token);
    } catch {
      /* ignore — treated as anonymous */
    }
  }
  next();
};

export const requireRole =
  (...roles: User['role'][]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth) return next(AppError.unauthorized());
    if (!roles.includes(req.auth.role)) return next(AppError.forbidden(`Requires role: ${roles.join(' or ')}`));
    next();
  };
