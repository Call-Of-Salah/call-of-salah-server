import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §11 */
export const friendsRouter = Router();

friendsRouter.get('/', (_req, res) => ok(res, { friends: [] }, 501));
friendsRouter.get('/requests', (_req, res) => ok(res, { requests: [] }, 501));
friendsRouter.post('/request', (_req, res) => ok(res, {}, 501));
friendsRouter.post('/accept', (_req, res) => ok(res, {}, 501));
friendsRouter.post('/decline', (_req, res) => ok(res, {}, 501));
friendsRouter.post('/mashaallah', (_req, res) => ok(res, { sent: true }, 501));
