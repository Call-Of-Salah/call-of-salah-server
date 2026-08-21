import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §7 / Part 5 §6 — league engine surfaces */
export const leaguesRouter = Router();

leaguesRouter.get('/me', (_req, res) => ok(res, {}, 501));
leaguesRouter.get('/me/history', (_req, res) => ok(res, { results: [] }, 501));
