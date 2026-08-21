import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §10 / Part 5 §7 — initiate + PIN confirm */
export const redemptionsRouter = Router();

redemptionsRouter.post('/initiate', (_req, res) => ok(res, {}, 501));
redemptionsRouter.post('/confirm', (_req, res) => ok(res, {}, 501));
