import { SignJWT } from 'jose';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { buildFakeUser } from '../testing/mocks/index.js';
import { createTestApp } from '../testing/testConfig.js';
import { createTestJwtKeys } from '../testing/jwt.js';

describe('GET /v1/users/me', () => {
  it('returns the authenticated user from the verified token, not a path id', async () => {
    const user = buildFakeUser();
    const { app, bearer, repositories } = await createTestApp({ users: [user] });
    const token = await bearer();

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
        id: user.id,
        authUid: user.authUid,
        status: user.status,
        role: user.role,
        masjidId: user.masjidId,
      },
      meta: { request_id: expect.any(String) },
    });
    expect(res.headers['cache-control']).toBe('no-store');
    expect(repositories.userRepository.findByAuthUid).toHaveBeenCalledExactlyOnceWith(user.authUid);
  });

  it('returns 401 NO_TOKEN when the Authorization header is missing', async () => {
    const { app } = await createTestApp();

    const res = await request(app).get('/v1/users/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('NO_TOKEN');
    expect(res.body.message).toBe('Missing or invalid Authorization header');
    expect(res.body.meta.request_id).toEqual(expect.any(String));
    expect(res.headers['x-request-id']).toBe(res.body.meta.request_id);
  });

  it('returns 401 NO_TOKEN for a non-Bearer scheme', async () => {
    const { app } = await createTestApp();

    const res = await request(app).get('/v1/users/me').set('Authorization', 'Basic abc');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('NO_TOKEN');
  });

  it('returns 401 INVALID_TOKEN for an HS256 token', async () => {
    const { app } = await createTestApp();
    const hs = await new SignJWT({ sub: 'supabase-auth-uid-1' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(new TextEncoder().encode('unit-test-only'));

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${hs}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('returns 401 INVALID_TOKEN for a forged signature', async () => {
    const { app } = await createTestApp();
    const other = await createTestJwtKeys();
    const forged = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: 'test-kan-65' })
      .setSubject('supabase-auth-uid-1')
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(other.privateKey);

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${forged}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
    expect(JSON.stringify(res.body)).not.toContain(forged);
  });

  it('returns 401 INVALID_TOKEN for an expired token', async () => {
    const user = buildFakeUser();
    const { app, signAccessToken } = await createTestApp({ users: [user] });
    const token = await signAccessToken(user.authUid, 0);

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('returns 401 INVALID_TOKEN for a wrong issuer', async () => {
    const user = buildFakeUser();
    const { app, signAccessToken } = await createTestApp({ users: [user] });
    const token = await signAccessToken(user.authUid, '5m', { issuer: 'https://evil.example/auth/v1' });

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('returns 401 INVALID_TOKEN for a wrong audience', async () => {
    const user = buildFakeUser();
    const { app, signAccessToken } = await createTestApp({ users: [user] });
    const token = await signAccessToken(user.authUid, '5m', { audience: 'anon' });

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('returns 401 INVALID_TOKEN for an unknown auth uid', async () => {
    const { app, signAccessToken } = await createTestApp({ users: [] });
    const token = await signAccessToken('no-such-auth-uid');

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('returns 403 ACCOUNT_SUSPENDED for a valid token on a suspended user', async () => {
    const user = buildFakeUser({ status: 'SUSPENDED' });
    const { app, bearer } = await createTestApp({ users: [user] });
    const token = await bearer();

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ACCOUNT_SUSPENDED');
    expect(res.body.message).toBe('Account is suspended');
  });

  it('allows DELETION_PENDING — only SUSPENDED and DELETED are gated', async () => {
    const user = buildFakeUser({ status: 'DELETION_PENDING' });
    const { app, bearer } = await createTestApp({ users: [user] });
    const token = await bearer();

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DELETION_PENDING');
  });

  it('returns 410 ACCOUNT_DELETED for a valid token on a deleted user', async () => {
    const user = buildFakeUser({ status: 'DELETED' });
    const { app, bearer } = await createTestApp({ users: [user] });
    const token = await bearer();

    const res = await request(app).get('/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(410);
    expect(res.body.error).toBe('ACCOUNT_DELETED');
    expect(res.body.message).toBe('Account has been deleted');
  });

  it('does not expose GET /v1/users/:id', async () => {
    const { app, bearer, defaultUser } = await createTestApp();
    const token = await bearer();

    const res = await request(app)
      .get(`/v1/users/${defaultUser!.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });
});
