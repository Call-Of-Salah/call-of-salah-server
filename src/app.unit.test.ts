import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createTestApp } from './testing/testConfig.js';

describe('createApp', () => {
  it('serves GET /health without touching a repository', async () => {
    const { app, repositories } = await createTestApp();

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(repositories.masjidRepository.findById).not.toHaveBeenCalled();
    expect(repositories.userRepository.findByAuthUid).not.toHaveBeenCalled();
  });

  it('answers an unknown route with the JSON envelope, not Express HTML', async () => {
    const { app } = await createTestApp();

    const res = await request(app).get('/v1/nope');

    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.error).toBe('NO_TOKEN');
    expect(res.body.message).toBe('Missing or invalid Authorization header');
    expect(res.body.meta.request_id).toEqual(expect.any(String));
  });

  it('answers an unknown authenticated route with NOT_FOUND', async () => {
    const { app, bearer } = await createTestApp();
    const token = await bearer();

    const res = await request(app).get('/v1/nope').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: 'NOT_FOUND',
      message: 'Route not found',
      meta: { request_id: expect.any(String) },
    });
  });
});
