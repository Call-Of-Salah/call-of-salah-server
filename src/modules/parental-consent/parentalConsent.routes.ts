import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §12 — parental consent for ages 13–15 */
export const parentalConsentRouter = Router();

parentalConsentRouter.post('/resend', (_req, res) => ok(res, {}, 501));
