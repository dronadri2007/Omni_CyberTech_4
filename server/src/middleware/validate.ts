import { RequestHandler } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Validate and coerce `req.body` / `req.query` / `req.params` against a Zod schema.
 * On success the parsed value replaces the original so downstream handlers get typed, trimmed input.
 */
export const validate =
  (schemas: { body?: AnyZodObject; query?: AnyZodObject; params?: AnyZodObject }): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query ?? {}));
      if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params ?? {}));
      next();
    } catch (err) {
      if (err instanceof ZodError) return next(err);
      next(err);
    }
  };
