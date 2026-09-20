import { vi } from 'vitest';

import type { UserRecord } from '../../common/repositories/interfaces/index.js';

export function createMockUserRepository(seed: UserRecord[] = []) {
  const rows = new Map(seed.map((row) => [row.id, row]));

  return {
    findById: vi.fn(async (id: string): Promise<UserRecord | null> => rows.get(id) ?? null),
  };
}
