import type { PrismaClient } from '../../generated/prisma/client.js';
import type { MasjidPrayerTimeModel } from '../../generated/prisma/models.js';
import type { MasjidPrayerTimeRepository } from './interfaces/masjidPrayerTimeRepository.js';

export class PrismaMasjidPrayerTimeRepository implements MasjidPrayerTimeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByMasjidAndDate(masjidId: string, dateYmd: string): Promise<MasjidPrayerTimeModel[]> {
    return this.prisma.masjidPrayerTime.findMany({
      where: { masjidId, date: new Date(`${dateYmd}T00:00:00.000Z`) },
    });
  }
}
