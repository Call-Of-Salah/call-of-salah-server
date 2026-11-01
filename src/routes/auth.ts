import { Router } from 'express';

import { createAuthController } from '../controllers/authController.js';
import { validateBody } from '../common/middlewares/validate.js';
import type { UserService } from '../common/services/userService.js';
import { registerParentBodySchema } from './auth.schema.js';

export interface AuthRouterDeps {
  userService: UserService;
}

export function createAuthRouter(deps: AuthRouterDeps): Router {
  const router = Router();
  const controller = createAuthController(deps);

  router.post('/register/parent', validateBody(registerParentBodySchema), controller.registerParent);

  return router;
}
