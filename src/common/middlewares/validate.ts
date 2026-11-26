import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../errors.js';

/**
 * Validates `req.params` and throws a `ValidationError` when it fails, so anything further
 * down the chain only ever runs against input that already matched its schema. The
 * terminal error handler formats the thrown error into the standard envelope.
 *
 * Returns a `RequestHandler` so it composes in a route chain:
 * `router.get(path, validateParams(schema), controller.handler)`.
 */
export function validateParams(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(
        new ValidationError(
          result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        ),
      );
      return;
    }

    next();
  };
}

/**
 * Validates the query string and stores the parsed values for the controller. Keeping
 * parsed values matters for schemas that coerce query strings into numbers.
 */
export function validateQuery(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(
        new ValidationError(
          result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        ),
      );
      return;
    }

    res.locals['validatedQuery'] = result.data;
    next();
  };
}

/**
 * Stashes the response schema on `res.locals` for `sendSuccess` to check the controller's
 * body before it goes out. The error handler sends its own differently-shaped envelope.
 */
export function validateResponse(schema: ZodType): RequestHandler {
  return (_req, res, next) => {
    res.locals['responseSchema'] = schema;
    next();
  };
}
