import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { buildFakeMasjid } from '../testing/mocks/index.js';
import { createTestApp } from '../testing/testConfig.js';

describe('GET /v1/masajid/:masjidId', () => {
  it('returns the masjid wrapped in the standard envelope', async () => {
    const masjid = buildFakeMasjid();
    const { app, repositories } = createTestApp({ masajid: [masjid] });

    const res = await request(app).get(`/v1/masajid/${masjid.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 200,
      body: {
        id: masjid.id,
        name: masjid.name,
        addressLine1: masjid.addressLine1,
        addressLine2: null,
        city: masjid.city,
        postcode: masjid.postcode,
        latitude: 53.4808,
        longitude: -2.2426,
        geofenceRadiusMetres: 200,
        adminUserId: null,
        active: true,
        createdAt: masjid.createdAt.toISOString(),
      },
    });
    expect(repositories.masjidRepository.findById).toHaveBeenCalledExactlyOnceWith(masjid.id);
  });

  it('returns a 400 validation envelope for a non-uuid id', async () => {
    const { app } = createTestApp();

    const res = await request(app).get('/v1/masajid/not-a-uuid');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: 400,
      message: 'Validation failed',
      errors: [{ path: 'masjidId', message: 'Invalid UUID' }],
    });
  });

  it('returns a 404 envelope when the masjid does not exist', async () => {
    const { app } = createTestApp();

    const res = await request(app).get('/v1/masajid/22222222-2222-4222-8222-222222222222');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 404, message: 'Masjid not found' });
  });
});
