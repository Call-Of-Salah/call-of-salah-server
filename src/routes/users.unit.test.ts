import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createTestApp } from '../testing/testConfig.js';

describe('GET /v1/users/:userId', () => {
  it('returns the user wrapped in the standard envelope', async () => {
    const { app, repositories } = createTestApp({
      users: [{ id: 'abc', email: 'abc@example.com' }],
    });

    const res = await request(app).get('/v1/users/abc');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 200, body: { id: 'abc', email: 'abc@example.com' } });
    expect(repositories.userRepository.findById).toHaveBeenCalledExactlyOnceWith('abc');
  });

  it('returns a 404 envelope when the user does not exist', async () => {
    const { app } = createTestApp();

    const res = await request(app).get('/v1/users/missing');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 404, message: 'User not found' });
  });
});
