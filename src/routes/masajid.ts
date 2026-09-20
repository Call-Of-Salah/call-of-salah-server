import { Router } from 'express';
import { iocGetMasjidService } from '../common/ioc.js';
import { validateParams, validateResponse } from '../common/middlewares/validate.js';
import type { MasjidService } from '../common/services/index.js';
import { createMasjidController } from '../controllers/masjidController.js';
import { getMasjidParamsSchema, masjidResponseSchema } from './masajid.schema.js';

export interface MasjidRoutesDeps {
  masjidService: MasjidService;
}

export function masjidRoutesDeps(): MasjidRoutesDeps {
  return { masjidService: iocGetMasjidService() };
}

export function createMasjidRouter(deps: MasjidRoutesDeps): Router {
  const router = Router();
  const controller = createMasjidController(deps);

  router.get(
    '/:masjidId',
    validateParams(getMasjidParamsSchema),
    validateResponse(masjidResponseSchema),
    controller.getMasjidById,
  );

  return router;
}
