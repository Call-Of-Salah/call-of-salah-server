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

