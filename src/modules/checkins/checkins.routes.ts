import { Router } from 'express';
import { ok } from '../../lib/response.js';

/**
 * Part 7 §5 / Part 5 §4 — NFC check-in (core transactional endpoint).
 * Service will own the 8-step validation + atomic award pipeline.
 */
export const checkinsRouter = Router();

checkinsRouter.post('/', (_req, res) => ok(res, {}, 501));
checkinsRouter.get('/history', (_req, res) => ok(res, { checkins: [], total: 0 }, 501));
