import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { buildV1Router } from './routes.js';
import { errorHandler, notFound, requestId } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(requestId);

  app.use(`/${config.apiVersion}`, buildV1Router());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
