import { HttpStatus } from './httpStatus.js';

export interface ErrorDetail {
  path: string;
  message: string;
}

/**
 * Base for every error the app throws on purpose. The terminal error handler formats
 * these into the standard `{ status, message, errors }` envelope; anything that isn't an
 * `AppError` is treated as unexpected and comes back as a bare 500.
 */
export class AppError extends Error {
  constructor(
    public readonly status: HttpStatus,
    message: string,
    public readonly errors?: ErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors?: ErrorDetail[]) {
    super(HttpStatus.BAD_REQUEST, message, errors);
  }
}

export class ValidationError extends AppError {
  constructor(errors: ErrorDetail[], message = 'Validation failed') {
    super(HttpStatus.BAD_REQUEST, message, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(HttpStatus.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(HttpStatus.CONFLICT, message);
  }
}

export class NotImplementedError extends AppError {
  constructor(message = 'Not implemented') {
    super(HttpStatus.NOT_IMPLEMENTED, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
