import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors.js';
import { HttpStatus } from '../httpStatus.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  });
};
