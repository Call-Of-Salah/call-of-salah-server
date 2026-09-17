import express, { type Express } from 'express';

import { NotFoundError } from './common/errors.js';
import { errorHandler } from './common/middlewares/errorHandler.js';
import { createMasjidRouter, masjidRoutesDeps } from './routes/masajid.js';
import { createUserRouter, userRoutesDeps } from './routes/users.js';


export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/v1/users', createUserRouter(userRoutesDeps()));
  app.use('/v1/masajid', createMasjidRouter(masjidRoutesDeps()));

  app.use((_req, _res, next) => {
    next(new NotFoundError('Route not found'));
  });

  app.use(errorHandler);

  return app;
}
