import { Router } from 'express';

/** Part 7 — public health (no auth). Redis check deferred for pilot. */
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: '0.1.0',
    db: 'unchecked',
    redis: 'deferred',
  });
});
