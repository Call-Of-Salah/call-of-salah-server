import { Router } from 'express';
import { validateParams, validateQuery, validateResponse } from '../common/middlewares/validate.js';
import type { MasjidService } from '../common/services/index.js';
import { createMasjidController } from '../controllers/masjidController.js';
import {
  getMasjidParamsSchema,
  getPrayerTimesQuerySchema,
  masjidResponseSchema,
  prayerTimesResponseSchema,
} from './masajid.schema.js';

export interface MasjidRoutesDeps {
  masjidService: MasjidService;
}

export function createMasjidRouter(deps: MasjidRoutesDeps): Router {
  const router = Router();
  const controller = createMasjidController(deps);

  router.get(
    '/:masjidId/prayer-times',
    validateParams(getMasjidParamsSchema),
    validateQuery(getPrayerTimesQuerySchema),
    validateResponse(prayerTimesResponseSchema),
    controller.getPrayerTimes,
  );

  router.get(
    '/:masjidId',
    validateParams(getMasjidParamsSchema),
    validateResponse(masjidResponseSchema),
    controller.getMasjidById,
  );

  return router;
}
