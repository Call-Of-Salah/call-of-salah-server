import { Router } from 'express';
import { ok } from '../../lib/response.js';

/**
 * Part 7 §2 — /auth/*
 * Pilot: Supabase Auth phone OTP issues JWT; backend verifies (Architecture v2).
 */
export const authRouter = Router();

authRouter.post('/verify-phone', (_req, res) => {
  ok(res, { jwt: null, user: null }, 501);
});

authRouter.post('/google', (_req, res) => {
  ok(res, { jwt: null, user: null }, 501);
});

authRouter.delete('/session', (_req, res) => {
  ok(res, { signed_out: true }, 501);
});
