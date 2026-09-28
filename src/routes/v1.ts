import { Router } from 'express';

import { iocGetJwtVerifier, iocGetMasjidService, iocGetUserRepository } from '../common/ioc.js';
import type { JwtVerifier } from '../common/auth/jwtVerifier.js';
import { createRequireAuth } from '../common/middlewares/requireAuth.js';
import type { UserRepository } from '../common/repositories/interfaces/index.js';
import type { MasjidService } from '../common/services/index.js';
import { createMasjidRouter } from './masajid.js';
import { createUserRouter } from './users.js';

export interface V1RoutesDeps {
  jwtVerifier: JwtVerifier;
  userRepository: UserRepository;
  masjidService: MasjidService;
}

export function v1RoutesDeps(): V1RoutesDeps {
  return {
    jwtVerifier: iocGetJwtVerifier(),
    userRepository: iocGetUserRepository(),
    masjidService: iocGetMasjidService(),
  };
}

export function createV1Router(deps: V1RoutesDeps): Router {
  const router = Router();
  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.use(createRequireAuth({ jwtVerifier: deps.jwtVerifier, userRepository: deps.userRepository }));
  router.use('/users', createUserRouter());
  router.use('/masajid', createMasjidRouter({ masjidService: deps.masjidService }));
  return router;
}
