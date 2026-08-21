import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §9 / Part 5 §9 */
export const questsRouter = Router();

questsRouter.get('/', (_req, res) => ok(res, { quests: [] }, 501));
questsRouter.get('/me', (_req, res) => ok(res, { quests: [] }, 501));
