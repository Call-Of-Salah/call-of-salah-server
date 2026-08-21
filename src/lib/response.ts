import type { Response } from 'express';

export function ok<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({
    data,
    meta: { request_id: res.locals.requestId },
  });
}
