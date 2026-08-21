import { Router } from 'express';
import { ok } from '../../lib/response.js';

/** Part 7 §12 / Part 5 §10 */
export const notificationsRouter = Router();

notificationsRouter.get('/', (_req, res) => ok(res, { notifications: [], unread_count: 0 }, 501));
notificationsRouter.post('/read', (_req, res) => ok(res, { marked_read: 0 }, 501));
