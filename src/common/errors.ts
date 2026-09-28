import { HttpStatus } from './httpStatus.js';

export interface ErrorDetail {
  path: string;
  message: string;
}

/**
 * Base for every error the app throws on purpose. The terminal error handler formats
 * these into `{ error, message, details?, meta.request_id }`.
 */
export class AppError extends Error {
  constructor(
    public readonly status: HttpStatus,
    public readonly code: string,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: ErrorDetail[]) {
    super(HttpStatus.BAD_REQUEST, 'BAD_REQUEST', message, details);
  }
}

export class ValidationError extends AppError {
  constructor(details: ErrorDetail[], message = 'Validation failed') {
    super(HttpStatus.BAD_REQUEST, 'VALIDATION_FAILED', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code = 'UNAUTHORIZED', message = 'Unauthorized') {
    super(HttpStatus.UNAUTHORIZED, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(code = 'FORBIDDEN', message = 'Forbidden') {
    super(HttpStatus.FORBIDDEN, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(HttpStatus.NOT_FOUND, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(HttpStatus.CONFLICT, 'CONFLICT', message);
  }
}

export class GoneError extends AppError {
  constructor(code = 'GONE', message = 'Gone') {
    super(HttpStatus.GONE, code, message);
  }
}

export class NotImplementedError extends AppError {
  constructor(message = 'Not implemented') {
    super(HttpStatus.NOT_IMPLEMENTED, 'NOT_IMPLEMENTED', message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR', message);
  }
}
