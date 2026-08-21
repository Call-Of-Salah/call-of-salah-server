import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §8 / Part 5 §8 */
export const badgesRouter = Router();

badgesRouter.get('/', (_req, res) => ok(res, { badges: [] }, 501));
badgesRouter.get('/me', (_req, res) => ok(res, { earned: [], locked: [] }, 501));
