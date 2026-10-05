import type { RequestHandler } from 'express';

import { ForbiddenError, GoneError, UnauthorizedError } from '../errors.js';
import type { JwtVerifier } from '../auth/jwtVerifier.js';
import type { UserRepository } from '../repositories/interfaces/index.js';

export interface RequireAuthDeps {
  jwtVerifier: JwtVerifier;
  userRepository: UserRepository;
}

export function createRequireAuth(deps: RequireAuthDeps): RequestHandler {
  return async (req, _res, next) => {
    try {
      const header = req.headers.authorization;
      if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
        next(new UnauthorizedError('NO_TOKEN', 'Missing or invalid Authorization header'));
        return;
      }

      const token = header.slice('Bearer '.length).trim();
      if (token.length === 0) {
        next(new UnauthorizedError('NO_TOKEN', 'Missing or invalid Authorization header'));
        return;
      }

      let sub: string;
      try {
        ({ sub } = await deps.jwtVerifier.verify(token));
      } catch {
        next(new UnauthorizedError('INVALID_TOKEN', 'Supabase token invalid or expired'));
        return;
      }

      const user = await deps.userRepository.findByAuthUid(sub);
      if (!user) {
        next(new UnauthorizedError('INVALID_TOKEN', 'Supabase token invalid or expired'));
        return;
      }

      if (user.status === 'SUSPENDED') {
        next(new ForbiddenError('ACCOUNT_SUSPENDED', 'Account is suspended'));
        return;
      }

      if (user.status === 'DELETED') {
        next(new GoneError('ACCOUNT_DELETED', 'Account has been deleted'));
        return;
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}
