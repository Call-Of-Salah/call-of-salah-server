import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createTestApp } from '../testing/testConfig.js';

/**
 * Exercised through a real route rather than by calling `sendSuccess` directly, because the
 * behaviour under test only exists once `validateResponse` has put the schema on
 * `res.locals` — testing the function alone would skip the part that matters.
 */
describe('response validation', () => {
  it('strips fields the response schema does not declare', async () => {
    const { app } = createTestApp({
      repositories: {
        userRepository: {
          findById: vi.fn(async () => ({
            id: 'a',
            email: 'a@example.com',
            passwordHash: 'must-not-be-sent',
          })),
        } as never,
      },
    });

    const res = await request(app).get('/v1/users/a');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 200, body: { id: 'a', email: 'a@example.com' } });
  });

  it('returns a bare 500 when the body does not match the schema, leaking nothing', async () => {
    const { app } = createTestApp({
      repositories: {
        userRepository: {
          findById: vi.fn(async () => ({ id: 'a' })),
        } as never,
      },
    });

    const res = await request(app).get('/v1/users/a');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: 500, message: 'Internal server error' });
  });

  it('returns a bare 500 for an unexpected error, with no message or stack', async () => {
    const { app } = createTestApp({
      repositories: {
        userRepository: {
          findById: vi.fn(async () => {
            throw new Error('connection string postgres://user:password@host');
          }),
        } as never,
      },
    });

    const res = await request(app).get('/v1/users/a');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: 500, message: 'Internal server error' });
    expect(JSON.stringify(res.body)).not.toContain('password');
  });
});
