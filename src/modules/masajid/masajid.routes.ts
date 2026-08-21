import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §4 — /masajid/* */
export const masajidRouter = Router();

masajidRouter.get('/', (_req, res) => ok(res, { masajid: [] }, 501));
masajidRouter.get('/:id/prayer-times', (_req, res) => ok(res, {}, 501));
