import type { Express } from 'express';
import type { CryptoKey } from 'jose';

import { createApp } from '../app.js';
import { SupabaseJwtVerifier } from '../common/auth/jwtVerifier.js';
import { loadConfig } from '../common/config.js';
import { IocKey, resetTestContainer } from '../common/ioc.js';
import type { MasjidModel, UserModel } from '../generated/prisma/models.js';
import { createTestJwtKeys, signTestAccessToken, TEST_JWT_AUDIENCE, TEST_JWT_ISSUER } from './jwt.js';
import { buildFakeUser, createMockMasjidRepository, createMockUserRepository } from './mocks/index.js';

export interface TestRepositories {
  userRepository: ReturnType<typeof createMockUserRepository>;
  masjidRepository: ReturnType<typeof createMockMasjidRepository>;
}

export interface TestAppOptions {
  users?: UserModel[];
  masajid?: MasjidModel[];
  repositories?: Partial<TestRepositories>;
}

export interface TestApp {
  app: Express;
  repositories: TestRepositories;
  defaultUser: UserModel | undefined;
  bearer: (authUid?: string) => Promise<string>;
  signAccessToken: (
    sub: string,
    expirationTime?: string | number,
    claims?: { issuer?: string; audience?: string },
  ) => Promise<string>;
  privateKey: CryptoKey;
}

export async function createTestApp(options: TestAppOptions = {}): Promise<TestApp> {
  const keys = await createTestJwtKeys();
  const defaultUser = buildFakeUser();
  const users = options.users === undefined ? [defaultUser] : options.users;

  const repositories: TestRepositories = {
    userRepository: options.repositories?.userRepository ?? createMockUserRepository(users),
    masjidRepository:
      options.repositories?.masjidRepository ?? createMockMasjidRepository(options.masajid),
  };

  resetTestContainer({
    [IocKey.Config]: loadConfig({
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
      SUPABASE_URL: 'http://127.0.0.1:54321',
    }),
    [IocKey.UserRepository]: repositories.userRepository,
    [IocKey.MasjidRepository]: repositories.masjidRepository,
    [IocKey.JwtVerifier]: new SupabaseJwtVerifier(keys.getKey, {
      issuer: TEST_JWT_ISSUER,
      audience: TEST_JWT_AUDIENCE,
    }),
  });

  const signAccessToken = (
    sub: string,
    expirationTime: string | number = '5m',
    claims?: { issuer?: string; audience?: string },
  ) => signTestAccessToken(keys.privateKey, sub, expirationTime, claims);

  return {
    app: createApp(),
    repositories,
    defaultUser: users[0],
    privateKey: keys.privateKey,
    signAccessToken,
    bearer: async (authUid?: string) => {
      const sub = authUid ?? users[0]?.authUid;
      if (!sub) {
        throw new Error('createTestApp.bearer() needs a seeded user or an authUid');
      }
      return signAccessToken(sub);
    },
  };
}
