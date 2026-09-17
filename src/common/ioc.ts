import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';
import {
  InMemoryUserRepository,
  PrismaMasjidRepository,
  type MasjidRepository,
  type UserRepository,
} from './repositories/index.js';
import { MasjidService, UserService } from './services/index.js';

export enum Mode {
  SINGLETON = 'SINGLETON',
}

/** Every registration key, in one place, so each registration below stays self-consistent. */
export const IocKey = {
  UserRepository: 'UserRepository',
  UserService: 'UserService',
  PrismaClient: 'PrismaClient',
  MasjidRepository: 'MasjidRepository',
  MasjidService: 'MasjidService',
} as const;

/**
 * What each key resolves to. Everything keyed by the container goes through this, so a
 * registration whose factory returns the wrong type, a typo'd key, and a test that seeds a
 * mock under the wrong key are all compile errors rather than runtime surprises.
 */
export interface IocRegistry {
  [IocKey.UserRepository]: UserRepository;
  [IocKey.UserService]: UserService;
  [IocKey.PrismaClient]: PrismaClient;
  [IocKey.MasjidRepository]: MasjidRepository;
  [IocKey.MasjidService]: MasjidService;
}

interface Registration<Key extends keyof IocRegistry> {
  key: Key;
  mode: Mode;
  factory: () => IocRegistry[Key];
}

const serviceCache = new Map<string, unknown>();

export function resetContainer(): void {
  serviceCache.clear();
}

export const ioc = <Key extends keyof IocRegistry>(registration: Registration<Key>) => {
  return (): IocRegistry[Key] => {
    switch (registration.mode) {
      case Mode.SINGLETON:
        if (!serviceCache.has(registration.key))
          serviceCache.set(registration.key, registration.factory());
        return serviceCache.get(registration.key) as IocRegistry[Key];
      default:
        throw new Error(`Unhandled container mode: ${registration.mode}`);
    }
  };
};
// ---------------------------------------------------------------------------
// Registrations — the only place that knows how the real graph is assembled.
// ---------------------------------------------------------------------------

export const iocGetUserRepository = ioc({
  key: IocKey.UserRepository,
  mode: Mode.SINGLETON,
  factory: (): UserRepository => new InMemoryUserRepository(),
});

export const iocGetUserService = ioc({
  key: IocKey.UserService,
  mode: Mode.SINGLETON,
  factory: () => new UserService(iocGetUserRepository()),
});

// DATABASE_URL is the transaction pooler — see AGENTS.md "Database". The CLI (migrate,
// introspect) connects separately, straight to DIRECT_URL, via prisma.config.ts.
//
// TODO(Phase 2): register a disposer once disposeContainer() exists so this pool closes
// on SIGTERM.
export const iocGetPrismaClient = ioc({
  key: IocKey.PrismaClient,
  mode: Mode.SINGLETON,
  factory: (): PrismaClient => {
    const databaseUrl = process.env['DATABASE_URL'];
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    return new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
  },
});

export const iocGetMasjidRepository = ioc({
  key: IocKey.MasjidRepository,
  mode: Mode.SINGLETON,
  factory: (): MasjidRepository => new PrismaMasjidRepository(iocGetPrismaClient()),
});

export const iocGetMasjidService = ioc({
  key: IocKey.MasjidService,
  mode: Mode.SINGLETON,
  factory: () => new MasjidService(iocGetMasjidRepository()),
});

// ---------------------------------------------------------------------------
// Testing — the substitution seam. Only src/testing calls this.
// ---------------------------------------------------------------------------
/**
 * Every registered repository. Derived from the keys, not hand-listed, so a new
 * `*Repository` registration immediately becomes a compile error in `createTestApp()`
 * rather than silently resolving the real, Prisma-backed one inside a unit test.
 */
export type RepositoryKey = Extract<keyof IocRegistry, `${string}Repository`>;

export function resetTestContainer(
  mocks: Pick<IocRegistry, RepositoryKey> & Partial<IocRegistry>,
): void {
  serviceCache.clear();
  for (const [key, instance] of Object.entries(mocks)) {
    if (instance !== undefined) serviceCache.set(key, instance);
  }
}
