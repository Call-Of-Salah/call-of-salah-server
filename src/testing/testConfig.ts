import type { Express } from 'express';

import { createApp } from '../app.js';
import { IocKey, resetTestContainer } from '../common/ioc.js';
import type { UserRecord } from '../common/repositories/interfaces/index.js';
import type { MasjidModel } from '../generated/prisma/models.js';
import { createMockMasjidRepository, createMockUserRepository } from './mocks/index.js';

export interface TestRepositories {
  userRepository: ReturnType<typeof createMockUserRepository>;
  masjidRepository: ReturnType<typeof createMockMasjidRepository>;
}

export interface TestAppOptions {
  users?: UserRecord[];
  masajid?: MasjidModel[];
  repositories?: Partial<TestRepositories>;
}

export interface TestApp {
  app: Express;
  repositories: TestRepositories;
}


export function createTestApp(options: TestAppOptions = {}): TestApp {
  const repositories: TestRepositories = {
    userRepository: options.repositories?.userRepository ?? createMockUserRepository(options.users),
    masjidRepository:
      options.repositories?.masjidRepository ?? createMockMasjidRepository(options.masajid),
  };

  resetTestContainer({
    [IocKey.UserRepository]: repositories.userRepository,
    [IocKey.MasjidRepository]: repositories.masjidRepository,
  });

  return { app: createApp(), repositories };
}