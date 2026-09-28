import { vi } from 'vitest';

import type { UserModel } from '../../generated/prisma/models.js';
import { buildFakeMasjid } from './mockMasjidRepository.js';

export function buildFakeUser(overrides: Partial<UserModel> = {}): UserModel {
  return {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    authUid: 'supabase-auth-uid-1',
    status: 'ID_VERIFIED',
    role: 'USER',
    masjidId: buildFakeMasjid().id,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createMockUserRepository(seed: UserModel[] = []) {
  const byId = new Map(seed.map((row) => [row.id, row]));
  const byAuthUid = new Map(seed.map((row) => [row.authUid, row]));

  return {
    findById: vi.fn(async (id: string): Promise<UserModel | null> => byId.get(id) ?? null),
    findByAuthUid: vi.fn(async (authUid: string): Promise<UserModel | null> => byAuthUid.get(authUid) ?? null),
  };
}
