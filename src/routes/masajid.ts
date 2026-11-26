import { Router } from 'express';
import { createRequireAuth, createRequireJwt } from '../common/middlewares/requireAuth.js';
import { validateParams, validateQuery, validateResponse } from '../common/middlewares/validate.js';
import type { JwtVerifier } from '../common/auth/jwtVerifier.js';
import type { UserRepository } from '../common/repositories/interfaces/index.js';
import type { MasjidService } from '../common/services/index.js';
import { createMasjidController } from '../controllers/masjidController.js';
import {
  getMasjidParamsSchema,
  getPrayerTimesQuerySchema,
  listMasajidQuerySchema,
  masjidListResponseSchema,
  masjidResponseSchema,
  prayerTimesResponseSchema,
} from './masajid.schema.js';

export interface MasjidRoutesDeps {
  masjidService: MasjidService;
  jwtVerifier: JwtVerifier;
  userRepository: UserRepository;
}

export function createMasjidRouter(deps: MasjidRoutesDeps): Router {
  const router = Router();
  const controller = createMasjidController(deps);
  const requireJwt = createRequireJwt({ jwtVerifier: deps.jwtVerifier });
  const requireAuth = createRequireAuth({
    jwtVerifier: deps.jwtVerifier,
    userRepository: deps.userRepository,
  });

  router.get(
    '/',
    requireJwt,
    validateQuery(listMasajidQuerySchema),
    validateResponse(masjidListResponseSchema),
    controller.listMasajid,
  );

  router.get(
    '/:masjidId/prayer-times',
    requireAuth,
    validateParams(getMasjidParamsSchema),
    validateQuery(getPrayerTimesQuerySchema),
    validateResponse(prayerTimesResponseSchema),
    controller.getPrayerTimes,
  );

  router.get(
    '/:masjidId',
    requireAuth,
    validateParams(getMasjidParamsSchema),
    validateResponse(masjidResponseSchema),
    controller.getMasjidById,
  );

  return router;
}
