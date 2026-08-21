import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §10 — reward catalogue */
export const rewardsRouter = Router();

rewardsRouter.get('/', (_req, res) => ok(res, { credits_balance: 0, rewards: [] }, 501));
