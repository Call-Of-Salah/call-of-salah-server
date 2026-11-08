import { vi } from 'vitest';

import type { PrayerName } from '../../generated/prisma/enums.js';
import type { MasjidPrayerTimeModel } from '../../generated/prisma/models.js';

export function jamaatAt(hours: number, minutes = 0): Date {
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
}

export function buildFakePrayerTime(
  overrides: Partial<MasjidPrayerTimeModel> & { prayer: PrayerName } = { prayer: 'FAJR' },
): MasjidPrayerTimeModel {
  return {
    id: '33333333-3333-4333-8333-333333333333',
    masjidId: '11111111-1111-4111-8111-111111111111',
    date: new Date('2026-07-15T00:00:00.000Z'),
    jamaatTime: jamaatAt(4, 0),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createMockMasjidPrayerTimeRepository(seed: MasjidPrayerTimeModel[] = []) {
  return {
    findByMasjidAndDate: vi.fn(
      async (masjidId: string, dateYmd: string): Promise<MasjidPrayerTimeModel[]> => {
        return seed.filter(
          (row) => row.masjidId === masjidId && row.date.toISOString().startsWith(dateYmd),
        );
      },
    ),
  };
}
