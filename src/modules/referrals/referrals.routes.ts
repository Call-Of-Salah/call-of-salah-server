import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §12 */
export const referralsRouter = Router();

referralsRouter.get('/link', (_req, res) => ok(res, {}, 501));
