import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createTestApp } from './testing/testConfig.js';

describe('createApp', () => {
  it('serves GET /health without touching a repository', async () => {
    const { app, repositories } = createTestApp();

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(repositories.masjidRepository.findById).not.toHaveBeenCalled();
  });

  it('answers an unknown route with the JSON envelope, not Express HTML', async () => {
    const { app } = createTestApp();

    const res = await request(app).get('/v1/nope');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({ status: 404, message: 'Route not found' });
  });
});
