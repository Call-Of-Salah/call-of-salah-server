import request from 'supertest';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { ConflictError } from '../common/errors.js';
import type { IdentityUser } from '../common/auth/supabaseIdentityProvider.js';
import { buildFakeMasjid } from '../testing/mocks/index.js';
import { createTestApp, type TestApp } from '../testing/testConfig.js';

const MASJID = buildFakeMasjid();
const AUTH_UID = 'test-auth-uid';

const VERIFIED_IDENTITY: IdentityUser = {
  authUid: AUTH_UID,
  email: 'test@example.com',
  emailVerified: true,
};

const VALID_BODY = {
  display_name: 'Mehedi Bari',
  masjid_id: MASJID.id,
};

describe('POST /v1/auth/register/parent', () => {
  let testApp: TestApp;
  let getUser: Mock<(token: string) => Promise<IdentityUser>>;

  beforeEach(async () => {
    getUser = vi.fn<(token: string) => Promise<IdentityUser>>().mockResolvedValue(VERIFIED_IDENTITY);
    testApp = await createTestApp({
      users: [],
      masajid: [MASJID],
      identityProvider: { getUser },
    });
  });

  it('returns 201 with PENDING_ID_VERIFICATION on happy path', async () => {
    const token = await testApp.signAccessToken(AUTH_UID);

    const res = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      account_type: 'PARENT',
      status: 'PENDING_ID_VERIFICATION',
      id: expect.any(String),
    });
    expect(testApp.repositories.userRepository.create).toHaveBeenCalledOnce();
  });

  it('GET /v1/users/me succeeds after register — new row satisfies requireAuth', async () => {
    const token = await testApp.signAccessToken(AUTH_UID);

    const reg = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(reg.status).toBe(201);

    const me = await request(testApp.app)
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ id: reg.body.data.id });
  });

  it('returns 403 EMAIL_NOT_VERIFIED and creates no row when email is unconfirmed', async () => {
    getUser.mockResolvedValue({ ...VERIFIED_IDENTITY, emailVerified: false });
    const token = await testApp.signAccessToken(AUTH_UID);

    const res = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('EMAIL_NOT_VERIFIED');
    expect(testApp.repositories.userRepository.create).not.toHaveBeenCalled();
  });

  it('returns 409 EMAIL_ALREADY_REGISTERED when auth_uid already has a row', async () => {
    testApp.repositories.userRepository.create.mockRejectedValue(
      new ConflictError('EMAIL_ALREADY_REGISTERED', 'A user with this auth UID already exists'),
    );
    const token = await testApp.signAccessToken(AUTH_UID);

    const res = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('returns 401 NO_TOKEN when Authorization header is missing', async () => {
    const res = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .send(VALID_BODY);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('NO_TOKEN');
  });

  it('returns 401 INVALID_TOKEN when Supabase rejects the token', async () => {
    getUser.mockRejectedValue(new Error('INVALID_TOKEN'));
    const token = await testApp.signAccessToken(AUTH_UID);

    const res = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('returns 503 IDENTITY_PROVIDER_UNAVAILABLE when Supabase is unreachable', async () => {
    getUser.mockRejectedValue(new Error('PROVIDER_ERROR'));
    const token = await testApp.signAccessToken(AUTH_UID);

    const res = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('IDENTITY_PROVIDER_UNAVAILABLE');
  });

  it('returns 400 VALIDATION_FAILED for an unknown masjid_id', async () => {
    const token = await testApp.signAccessToken(AUTH_UID);

    const res = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_BODY, masjid_id: '00000000-0000-4000-8000-000000000000' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_FAILED');
    expect(res.body.details.issues[0].path).toBe('masjid_id');
  });

  it('returns 400 VALIDATION_FAILED for an invalid display_name', async () => {
    const token = await testApp.signAccessToken(AUTH_UID);

    const res = await request(testApp.app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_BODY, display_name: 'Bad@Name123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_FAILED');
  });
});
