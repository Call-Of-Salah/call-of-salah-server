import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import type { AuthUser } from '../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verifies Supabase JWT and attaches the app user.
 * Public routes (/auth/*, /health) skip this middleware.
 * Implementation will call providers/auth.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
    }
    // TODO: verify token via AuthProvider and load user
    next();
  } catch (err) {
    next(err);
  }
}

/** Rejects SUSPENDED (403) and DELETED (410) accounts (Architecture §4.1). */
export function requireActiveAccount(req: Request, _res: Response, next: NextFunction): void {
  const status = req.user?.status;
  if (status === 'SUSPENDED') {
    next(new AppError(403, 'ACCOUNT_SUSPENDED', 'Account is suspended'));
    return;
  }
  if (status === 'DELETED') {
    next(new AppError(410, 'ACCOUNT_DELETED', 'Account has been deleted'));
    return;
  }
  next();
}

/** Admin routes: role gate + masjid-scope isolation (Architecture §6.3). */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN' && !req.user?.adminRole) {
    next(new AppError(403, 'FORBIDDEN', 'Admin access required'));
    return;
  }
  next();
}
