import type { MasjidPrayerTimeModel } from '../../../generated/prisma/models.js';

export interface MasjidPrayerTimeRepository {
  findByMasjidAndDate(masjidId: string, dateYmd: string): Promise<MasjidPrayerTimeModel[]>;
}
