import type { Request, Response } from 'express';

import { sendSuccess } from '../common/responses.js';
import type { UserService } from '../common/services/userService.js';
import type { RegisterParentBody } from '../routes/auth.schema.js';

export interface AuthControllerDeps {
  userService: UserService;
}

export function createAuthController(deps: AuthControllerDeps) {
  return {
    registerParent: async (req: Request, res: Response): Promise<void> => {
      const body = req.body as RegisterParentBody;
      const token = res.locals.token as string;

      const user = await deps.userService.registerParent({ ...body, token });

      sendSuccess(res, { user: { id: user.id, account_type: user.accountType, status: user.status } }, 201);
    },
  };
}
