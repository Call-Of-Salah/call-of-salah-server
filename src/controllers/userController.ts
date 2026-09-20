import type { Request, Response } from 'express';

import { NotFoundError } from '../common/errors.js';
import { sendSuccess } from '../common/responses.js';
import type { UserService } from '../common/services/index.js';
import type { GetUserParams } from '../routes/users.schema.js';

export interface UserControllerDeps {
  userService: UserService;
}
export function createUserController(deps: UserControllerDeps) {
  return {
    getUserById: async (req: Request<GetUserParams>, res: Response): Promise<void> => {
      const user = await deps.userService.getUser(req.params.userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      sendSuccess(res, user);
    },
  };
}
