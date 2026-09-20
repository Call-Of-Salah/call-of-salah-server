import { Router } from 'express';
import { iocGetUserService } from '../common/ioc.js';
import { validateParams, validateResponse } from '../common/middlewares/validate.js';
import type { UserService } from '../common/services/index.js';
import { createUserController } from '../controllers/userController.js';
import { getUserParamsSchema, userResponseSchema } from './users.schema.js';

export interface UserRoutesDeps {
  userService: UserService;
}

export function userRoutesDeps(): UserRoutesDeps {
  return { userService: iocGetUserService() };
}

export function createUserRouter(deps: UserRoutesDeps): Router {
  const router = Router();
  const controller = createUserController(deps);

  router.get(
    '/:userId',
    validateParams(getUserParamsSchema),
    validateResponse(userResponseSchema),
    controller.getUserById,
  );

  return router;
}
