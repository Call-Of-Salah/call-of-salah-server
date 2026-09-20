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
 * Stashes the response schema on `res.locals` for `sendSuccess` to check the controller's
 * `body` against before it goes out. Deliberately doesn't touch `res.json` itself — the
 * terminal error handler calls that directly with a differently-shaped envelope, and
 * patching it here would run that through this schema too.
 *
 * Lives in the route chain like `validateParams`, so the controller itself stays a plain
 * `sendSuccess(res, payload)` with no explicit validation call to remember:
 * `router.get(path, validateParams(schema), validateResponse(responseSchema), controller.handler)`.
 */
export function validateResponse(schema: ZodType): RequestHandler {
  return (_req, res, next) => {
    res.locals['responseSchema'] = schema;
    next();
  };
}
