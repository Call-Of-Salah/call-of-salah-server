import type { Request, Response } from 'express';

import { UnauthorizedError } from '../common/errors.js';
import { sendSuccess } from '../common/responses.js';

export function createUserController() {
  return {
    getMe: async (req: Request, res: Response): Promise<void> => {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError('NO_TOKEN', 'Missing or invalid Authorization header');
      }

      sendSuccess(res, {
        id: user.id,
        authUid: user.authUid,
        status: user.status,
        role: user.role,
        masjidId: user.masjidId,
      });
    },
  };
}
