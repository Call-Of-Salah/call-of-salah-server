import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §13 / Part 9 — masjid-scoped admin API */
export const adminRouter = Router();

adminRouter.get('/users', (_req, res) => ok(res, { users: [], total: 0 }, 501));
adminRouter.patch('/users/:id/verify', (_req, res) => ok(res, {}, 501));
adminRouter.patch('/users/:id/suspend', (_req, res) => ok(res, {}, 501));
adminRouter.get('/nfc-tags', (_req, res) => ok(res, { tags: [] }, 501));
adminRouter.post('/nfc-tags/:id/rotate', (_req, res) => ok(res, {}, 501));
adminRouter.post('/prayer-times', (_req, res) => ok(res, {}, 501));
adminRouter.get('/quests', (_req, res) => ok(res, { quests: [] }, 501));
adminRouter.post('/quests', (_req, res) => ok(res, {}, 501));
adminRouter.patch('/quests/:id', (_req, res) => ok(res, {}, 501));
adminRouter.get('/rewards', (_req, res) => ok(res, { rewards: [] }, 501));
adminRouter.post('/rewards', (_req, res) => ok(res, {}, 501));
adminRouter.patch('/rewards/:id', (_req, res) => ok(res, {}, 501));
adminRouter.get('/stats', (_req, res) => ok(res, {}, 501));
