import { Router } from 'express';
import { validateResponse } from '../common/middlewares/validate.js';
import { createUserController } from '../controllers/userController.js';
import { meResponseSchema } from './users.schema.js';

export function createUserRouter(): Router {
  const router = Router();
  const controller = createUserController();

  router.get('/me', validateResponse(meResponseSchema), controller.getMe);

  return router;
}
