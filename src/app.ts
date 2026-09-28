import express, { type Express } from 'express';

import { NotFoundError } from './common/errors.js';
import { errorHandler } from './common/middlewares/errorHandler.js';
import { requestId } from './common/middlewares/requestId.js';
import { createV1Router, v1RoutesDeps } from './routes/v1.js';

export function createApp(): Express {
  const app = express();

  app.use(requestId);
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/v1', createV1Router(v1RoutesDeps()));

  app.use((_req, _res, next) => {
    next(new NotFoundError('Route not found'));
  });

  app.use(errorHandler);

  return app;
}
