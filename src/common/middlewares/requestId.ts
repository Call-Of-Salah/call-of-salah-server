import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();
  res.locals['requestId'] = id;
  res.setHeader('x-request-id', id);
  next();
};
