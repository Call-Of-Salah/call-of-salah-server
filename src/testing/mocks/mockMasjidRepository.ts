import { vi } from 'vitest';

import type { MasjidModel } from '../../generated/prisma/models.js';

export function buildFakeMasjid(overrides: Partial<MasjidModel> = {}): MasjidModel {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Test Masjid',
    addressLine1: '1 High St',
    addressLine2: null,
    city: 'Manchester',
    postcode: 'M1 1AA',
    latitude: 53.4808,
    longitude: -2.2426,
    geofenceRadiusMetres: 200,
    adminUserId: null,
    active: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createMockMasjidRepository(seed: MasjidModel[] = []) {
  const rows = new Map(seed.map((row) => [row.id, row]));

  return {
    findById: vi.fn(async (id: string): Promise<MasjidModel | null> => rows.get(id) ?? null),
  };
}
