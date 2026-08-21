import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { isAppError } from '../errors/AppError.js';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  res.locals.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Route not found',
    meta: { request_id: res.locals.requestId },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const request_id = res.locals.requestId;

  if (isAppError(err)) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      details: err.details,
      meta: { request_id },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    meta: { request_id },
  });
}
