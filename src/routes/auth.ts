import { Router } from 'express';

import { createAuthController } from '../controllers/authController.js';
import { validateBody, validateResponse } from '../common/middlewares/validate.js';
import { extractTokenFromHeaderMiddleware } from '../common/middlewares/requireAuth.js';
import type { UserService } from '../common/services/userService.js';
import { registerParentBodySchema, registerParentResponseSchema } from './auth.schema.js';

export interface AuthRouterDeps {
  userService: UserService;
}

export function createAuthRouter(deps: AuthRouterDeps): Router {
  const router = Router();
  const controller = createAuthController(deps);

  router.post(
    '/register/parent',
    extractTokenFromHeaderMiddleware(),
    validateBody(registerParentBodySchema),
    validateResponse(registerParentResponseSchema),
    controller.registerParent,
  );

  return router;
}
