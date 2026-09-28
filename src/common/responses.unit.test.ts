import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { buildFakeUser } from '../testing/mocks/index.js';
import { createTestApp } from '../testing/testConfig.js';

/**
 * Exercised through a real route rather than by calling `sendSuccess` directly, because the
 * behaviour under test only exists once `validateResponse` has put the schema on
 * `res.locals` — testing the function alone would skip the part that matters.
 */
describe('response validation', () => {
  it('strips fields the response schema does not declare', async () => {
    const user = buildFakeUser();
    const { app, bearer } = await createTestApp({
      repositories: {
        userRepository: {
          findById: vi.fn(),
          findByAuthUid: vi.fn(async () => ({
            ...user,
            createdAt: user.createdAt,
            extraSecret: 'must-not-be-sent',
          })),
        } as never,
      },
    });
    const token = await bearer(user.authUid);

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      id: user.id,
      authUid: user.authUid,
      status: user.status,
      role: user.role,
      masjidId: user.masjidId,
    });
    expect(JSON.stringify(res.body)).not.toContain('must-not-be-sent');
  });

  it('returns a bare 500 when the body does not match the schema, leaking nothing', async () => {
    const user = buildFakeUser();
    const { app, bearer } = await createTestApp({
      repositories: {
        userRepository: {
          findById: vi.fn(),
          findByAuthUid: vi.fn(async () => ({ id: user.id, authUid: user.authUid })),
        } as never,
      },
    });
    const token = await bearer(user.authUid);

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
      meta: { request_id: expect.any(String) },
    });
  });

  it('returns a bare 500 for an unexpected error, with no message or stack', async () => {
    const user = buildFakeUser();
    const { app, bearer } = await createTestApp({
      repositories: {
        userRepository: {
          findById: vi.fn(),
          findByAuthUid: vi.fn(async () => {
            throw new Error('connection string postgres://user:password@host');
          }),
        } as never,
      },
    });
    const token = await bearer(user.authUid);

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
      meta: { request_id: expect.any(String) },
    });
    expect(JSON.stringify(res.body)).not.toContain('password');
  });
});
