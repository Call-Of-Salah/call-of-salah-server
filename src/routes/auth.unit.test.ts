import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';
import type { IdentityUser, JwtVerifier } from '../common/auth/jwtVerifier.js';
import { loadConfig } from '../common/config.js';
import { ConflictError } from '../common/errors.js';
import { IocKey, resetTestContainer } from '../common/ioc.js';
import { buildFakeMasjid, buildFakeUser, createMockMasjidRepository, createMockUserRepository } from '../testing/mocks/index.js';
import { createTestJwtKeys, signTestAccessToken } from '../testing/jwt.js';

const MASJID = buildFakeMasjid();

const VALID_BODY = {
  first_name: 'Mehedi',
  last_name: 'Bari',
  username: 'mehedi_bari',
  date_of_birth: '1995-06-15',
  masjid_id: MASJID.id,
  phone_number: '+447700900000',
};

const VERIFIED_IDENTITY: IdentityUser = {
  authUid: 'test-auth-uid',
  email: 'test@example.com',
  emailVerified: true,
};

async function setup(identityOverride?: Partial<IdentityUser>) {
  const keys = await createTestJwtKeys();
  const token = await signTestAccessToken(keys.privateKey, VERIFIED_IDENTITY.authUid);

  const getUser = vi.fn<[string], Promise<IdentityUser>>().mockResolvedValue({
    ...VERIFIED_IDENTITY,
    ...identityOverride,
  });

  const mockJwtVerifier: JwtVerifier = {
    verify: vi.fn().mockResolvedValue({ sub: VERIFIED_IDENTITY.authUid }),
    getUser,
  };

  const userRepository = createMockUserRepository([]);
  const masjidRepository = createMockMasjidRepository([MASJID]);

  resetTestContainer({
    [IocKey.Config]: loadConfig({
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
      SUPABASE_URL: 'http://127.0.0.1:54321',
      SUPABASE_PUBLISHABLE_KEY: 'test-key',
    }),
    [IocKey.UserRepository]: userRepository,
    [IocKey.MasjidRepository]: masjidRepository,
    [IocKey.JwtVerifier]: mockJwtVerifier,
  });

  return { app: createApp(), token, userRepository, masjidRepository, getUser };
}

describe('POST /v1/auth/register/parent', () => {
  it('returns 201 with PENDING_ID_VERIFICATION on happy path', async () => {
    const { app, token, userRepository } = await setup();

    const res = await request(app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({
      account_type: 'PARENT',
      status: 'PENDING_ID_VERIFICATION',
      id: expect.any(String),
    });
    expect(userRepository.create).toHaveBeenCalledOnce();
  });

  it('returns 403 EMAIL_NOT_VERIFIED and creates no row when email is unconfirmed', async () => {
    const { app, token, userRepository } = await setup({ emailVerified: false });

    const res = await request(app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('EMAIL_NOT_VERIFIED');
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('returns 409 EMAIL_ALREADY_REGISTERED when auth_uid already has a row', async () => {
    const { app, token, userRepository } = await setup();
    userRepository.create.mockRejectedValue(
      new ConflictError('EMAIL_ALREADY_REGISTERED', 'A user with this auth UID already exists'),
    );

    const res = await request(app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('returns 401 NO_TOKEN when Authorization header is missing', async () => {
    const { app } = await setup();

    const res = await request(app)
      .post('/v1/auth/register/parent')
      .send(VALID_BODY);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('NO_TOKEN');
  });

  it('returns 401 INVALID_TOKEN when identity provider fails', async () => {
    const { app, token, getUser } = await setup();
    getUser.mockRejectedValue(new Error('Supabase unreachable'));

    const res = await request(app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_BODY);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('returns 400 VALIDATION_FAILED for an unknown masjid_id', async () => {
    const { app, token } = await setup();

    const res = await request(app)
      .post('/v1/auth/register/parent')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_BODY, masjid_id: '00000000-0000-4000-8000-000000000000' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_FAILED');
    expect(res.body.details.issues[0].path).toBe('masjid_id');
  });
});
