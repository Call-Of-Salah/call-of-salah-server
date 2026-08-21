import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §6 / Part 5 §5 — streak engine surfaces */
export const streaksRouter = Router();

streaksRouter.get('/me', (_req, res) => ok(res, {}, 501));
