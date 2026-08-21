import type { NextFunction, Request, Response } from 'express';

/**
 * Sliding-window rate limits (Architecture §6.4).
 * Pilot: Postgres-backed counters (Redis deferred).
 */
export function rateLimit(_opts: {
  key: string;
  limit: number;
  windowSeconds: number;
  by: 'user' | 'ip' | 'phone';
}) {
  return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // TODO: CacheProvider.increment / check
    next();
  };
}
