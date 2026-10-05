import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors.js';
import { HttpStatus } from '../httpStatus.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const request_id = (res.locals['requestId'] as string | undefined) ?? '';

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: err.code,
      message: err.message,
      ...(err.details ? { details: { issues: err.details } } : {}),
      meta: { request_id },
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
    meta: { request_id },
  });
};
