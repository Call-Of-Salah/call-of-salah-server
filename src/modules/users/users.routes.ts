import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §3 — /users/* */
export const usersRouter = Router();

usersRouter.get('/me', (_req, res) => ok(res, {}, 501));
usersRouter.patch('/me', (_req, res) => ok(res, { updated: true }, 501));
usersRouter.get('/check-username', (_req, res) => ok(res, { available: false }, 501));
usersRouter.get('/search', (_req, res) => ok(res, { users: [] }, 501));
usersRouter.delete('/delete', (_req, res) => ok(res, {}, 501));
usersRouter.post('/data-export', (_req, res) => ok(res, {}, 501));
usersRouter.patch('/notification-preferences', (_req, res) => ok(res, { updated: true }, 501));
