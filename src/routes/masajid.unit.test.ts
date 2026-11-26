import request from 'supertest';
import { describe, expect, it } from 'vitest';

import {
  buildFakeMasjid,
  buildFakePrayerTime,
  jamaatAt,
} from '../testing/mocks/index.js';
import { createTestApp } from '../testing/testConfig.js';

async function authedGet(path: string, masajid = [buildFakeMasjid()]) {
  const ctx = await createTestApp({ masajid });
  const token = await ctx.bearer();
  const res = await request(ctx.app).get(path).set('Authorization', `Bearer ${token}`);
  return { ...ctx, token, res };
}

describe('GET /v1/masajid/:masjidId', () => {
  it('returns the masjid wrapped in the standard envelope', async () => {
    const masjid = buildFakeMasjid();
    const { repositories, res } = await authedGet(`/v1/masajid/${masjid.id}`, [masjid]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
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
      meta: { request_id: expect.any(String) },
    });
    expect(repositories.masjidRepository.findById).toHaveBeenCalledExactlyOnceWith(masjid.id);
  });

  it('rejects a missing bearer token', async () => {
    const masjid = buildFakeMasjid();
    const { app } = await createTestApp({ masajid: [masjid] });

    const res = await request(app).get(`/v1/masajid/${masjid.id}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('NO_TOKEN');
  });

  it('returns a 400 validation envelope for a non-uuid id', async () => {
    const { res } = await authedGet('/v1/masajid/not-a-uuid');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'VALIDATION_FAILED',
      message: 'Validation failed',
      details: { issues: [{ path: 'masjidId', message: 'Invalid UUID' }] },
      meta: { request_id: expect.any(String) },
    });
  });

  it('returns a 404 envelope when the masjid does not exist', async () => {
    const { res } = await authedGet('/v1/masajid/22222222-2222-4222-8222-222222222222');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: 'NOT_FOUND',
      message: 'Masjid not found',
      meta: { request_id: expect.any(String) },
    });
  });
});

describe('GET /v1/masajid/:masjidId/prayer-times', () => {
  const date = '2026-07-15';
  const masjid = buildFakeMasjid();
  const times = [
    buildFakePrayerTime({ prayer: 'FAJR', jamaatTime: jamaatAt(4, 0), date: new Date(`${date}T00:00:00.000Z`) }),
    buildFakePrayerTime({
      id: '44444444-4444-4444-8444-444444444444',
      prayer: 'DHUHR',
      jamaatTime: jamaatAt(14, 0),
      date: new Date(`${date}T00:00:00.000Z`),
    }),
  ];

  it('returns windows with close = jamaat + 30 minutes', async () => {
    const { app, bearer, repositories } = await createTestApp({ masajid: [masjid], prayerTimes: times });
    const token = await bearer();

    const res = await request(app)
      .get(`/v1/masajid/${masjid.id}/prayer-times?date=${date}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      masjid_id: masjid.id,
      date,
      prayers: [
        { prayer: 'FAJR', jamaat_time: '04:00', window_open: '04:00', window_close: '04:30' },
        { prayer: 'DHUHR', jamaat_time: '14:00', window_open: '14:00', window_close: '14:30' },
      ],
      active_prayer: res.body.data.active_prayer,
    });
    expect([null, 'FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA']).toContain(res.body.data.active_prayer);
    expect(repositories.masjidPrayerTimeRepository.findByMasjidAndDate).toHaveBeenCalledWith(
      masjid.id,
      date,
    );
  });

  it('returns 404 MASJID_NOT_FOUND when the masjid does not exist', async () => {
    const { app, bearer } = await createTestApp({ masajid: [masjid], prayerTimes: times });
    const token = await bearer();

    const res = await request(app)
      .get('/v1/masajid/22222222-2222-4222-8222-222222222222/prayer-times?date=2026-07-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('MASJID_NOT_FOUND');
  });

  it('returns 503 PRAYER_TIMES_UNAVAILABLE when no times are set', async () => {
    const { app, bearer } = await createTestApp({ masajid: [masjid], prayerTimes: [] });
    const token = await bearer();

    const res = await request(app)
      .get(`/v1/masajid/${masjid.id}/prayer-times?date=${date}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('PRAYER_TIMES_UNAVAILABLE');
  });

  it('rejects a missing bearer token', async () => {
    const { app } = await createTestApp({ masajid: [masjid], prayerTimes: times });

    const res = await request(app).get(`/v1/masajid/${masjid.id}/prayer-times?date=${date}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('NO_TOKEN');
  });
});

describe('GET /v1/masajid', () => {
  it('verifies a JWT without requiring a user row and returns only picker fields', async () => {
    const active = buildFakeMasjid({ name: 'Active Masjid' });
    const inactive = buildFakeMasjid({
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Inactive Masjid',
      active: false,
    });
    const { app, repositories, bearer } = await createTestApp({
      users: [],
      masajid: [active, inactive],
    });
    const token = await bearer('auth-user-without-app-row');

    const res = await request(app)
      .get('/v1/masajid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toEqual({
      id: active.id,
      name: active.name,
      addressLine1: active.addressLine1,
      addressLine2: active.addressLine2,
      city: active.city,
      postcode: active.postcode,
      latitude: active.latitude,
      longitude: active.longitude,
    });
    expect(res.body.data[0]).not.toHaveProperty('distanceMiles');
    expect(res.body.data[0]).not.toHaveProperty('adminUserId');
    expect(res.body.data[0]).not.toHaveProperty('geofenceRadiusMetres');
    expect(res.body.data[0]).not.toHaveProperty('active');
    expect(res.body.data[0]).not.toHaveProperty('createdAt');
    expect(res.body.meta.request_id).toEqual(expect.any(String));
    expect(repositories.masjidRepository.findActive).toHaveBeenCalledExactlyOnceWith({
      search: undefined,
    });
    expect(repositories.userRepository.findByAuthUid).not.toHaveBeenCalled();
  });

  it('rejects missing and invalid bearer tokens', async () => {
    const { app } = await createTestApp();

    const missingToken = await request(app).get('/v1/masajid');
    const invalidToken = await request(app)
      .get('/v1/masajid')
      .set('Authorization', 'Bearer not-a-valid-jwt');

    expect(missingToken.status).toBe(401);
    expect(missingToken.body.error).toBe('NO_TOKEN');
    expect(invalidToken.status).toBe(401);
    expect(invalidToken.body.error).toBe('INVALID_TOKEN');
  });

  it('searches by name or postcode without case sensitivity', async () => {
    const byName = buildFakeMasjid({ name: 'Salaam Centre' });
    const byPostcode = buildFakeMasjid({
      id: '22222222-2222-4222-8222-222222222222',
      name: 'North Masjid',
      postcode: 'M2 1AA',
    });
    const unrelated = buildFakeMasjid({
      id: '33333333-3333-4333-8333-333333333333',
      name: 'West Masjid',
      postcode: 'W1 1AA',
    });
    const { app, bearer } = await createTestApp({ masajid: [byName, byPostcode, unrelated] });
    const token = await bearer();

    const nameRes = await request(app)
      .get('/v1/masajid?search=%20sALaAm%20')
      .set('Authorization', `Bearer ${token}`);
    const postcodeRes = await request(app)
      .get('/v1/masajid?search=m2%201aa')
      .set('Authorization', `Bearer ${token}`);

    expect(nameRes.status).toBe(200);
    expect(nameRes.body.data.map((masjid: { id: string }) => masjid.id)).toEqual([
      byName.id,
    ]);
    expect(postcodeRes.status).toBe(200);
    expect(postcodeRes.body.data.map((masjid: { id: string }) => masjid.id)).toEqual([
      byPostcode.id,
    ]);
  });

  it('sorts by nearest first and includes distance in miles when location is supplied', async () => {
    const sameLocation = buildFakeMasjid({
      name: 'Same Location',
      latitude: 0,
      longitude: 0,
    });
    const oneHundredthDegreeAway = buildFakeMasjid({
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Near Masjid',
      latitude: 0.01,
      longitude: 0,
    });
    const twoHundredthsAway = buildFakeMasjid({
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Far Masjid',
      latitude: 0.02,
      longitude: 0,
    });
    const { app, bearer } = await createTestApp({
      masajid: [twoHundredthsAway, oneHundredthDegreeAway, sameLocation],
    });
    const token = await bearer();

    const res = await request(app)
      .get('/v1/masajid?latitude=0&longitude=0')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.map((masjid: { name: string }) => masjid.name)).toEqual([
      'Same Location',
      'Near Masjid',
      'Far Masjid',
    ]);
    expect(res.body.data.map((masjid: { distanceMiles: number }) => masjid.distanceMiles)).toEqual([
      0,
      0.69,
      1.38,
    ]);
  });

  it('rejects out-of-range or incomplete location coordinates', async () => {
    const { app, bearer } = await createTestApp();
    const token = await bearer();

    const outOfRange = await request(app)
      .get('/v1/masajid?latitude=91&longitude=0')
      .set('Authorization', `Bearer ${token}`);
    const incomplete = await request(app)
      .get('/v1/masajid?latitude=51.5')
      .set('Authorization', `Bearer ${token}`);

    expect(outOfRange.status).toBe(400);
    expect(outOfRange.body.error).toBe('VALIDATION_FAILED');
    expect(incomplete.status).toBe(400);
    expect(incomplete.body.error).toBe('VALIDATION_FAILED');
  });
});
