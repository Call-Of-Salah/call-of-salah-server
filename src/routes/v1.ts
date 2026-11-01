import { Router } from 'express';

import { iocGetJwtVerifier, iocGetMasjidService, iocGetUserRepository, iocGetUserService } from '../common/ioc.js';
import type { JwtVerifier } from '../common/auth/jwtVerifier.js';
import { createRequireAuth, extractTokenFromHeaderMiddleware } from '../common/middlewares/requireAuth.js';
import type { UserRepository } from '../common/repositories/interfaces/index.js';
import type { MasjidService, UserService } from '../common/services/index.js';
import { createMasjidRouter } from './masajid.js';
import { createUserRouter } from './users.js';
import { createAuthRouter } from './auth.js';

export interface V1RoutesDeps {
  jwtVerifier: JwtVerifier;
  userRepository: UserRepository;
  masjidService: MasjidService;
  userService: UserService;
}

export function v1RoutesDeps(): V1RoutesDeps {
  return {
    jwtVerifier: iocGetJwtVerifier(),
    userRepository: iocGetUserRepository(),
    masjidService: iocGetMasjidService(),
    userService: iocGetUserService(),
  };
}

export function createV1Router(deps: V1RoutesDeps): Router {
  const router = Router();
  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.use(extractTokenFromHeaderMiddleware());
  router.use('/auth', createAuthRouter({ userService: deps.userService }));
  router.use(createRequireAuth({ jwtVerifier: deps.jwtVerifier, userRepository: deps.userRepository }));
  router.use('/users', createUserRouter());
  router.use('/masajid', createMasjidRouter({ masjidService: deps.masjidService }));
  return router;
}
