import type { PrayerName } from '../../generated/prisma/enums.js';
import type { MasjidModel } from '../../generated/prisma/models.js';
import { NotFoundError, ServiceUnavailableError } from '../errors.js';
import type { MasjidPrayerTimeRepository, MasjidRepository } from '../repositories/interfaces/index.js';
import { todayYmdInTimeZone } from '../utils/dateTime.js';
import { buildPrayerTimesPayload, type PrayerWindow } from './prayerWindow.js';

export interface PrayerTimesResult {
  masjid_id: string;
  date: string;
  prayers: PrayerWindow[];
  active_prayer: PrayerName | null;
}

export class MasjidService {
  constructor(
    private readonly masajid: MasjidRepository,
    private readonly prayerTimes: MasjidPrayerTimeRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async getMasjid(id: string): Promise<MasjidModel | null> {
    return this.masajid.findById(id);
  }

  async getPrayerTimes(masjidId: string, dateYmd?: string): Promise<PrayerTimesResult> {
    const masjid = await this.masajid.findById(masjidId);
    if (!masjid) {
      throw new NotFoundError('Masjid not found', 'MASJID_NOT_FOUND');
    }

    const date = dateYmd ?? todayYmdInTimeZone(this.clock());
    const rows = await this.prayerTimes.findByMasjidAndDate(masjidId, date);
    const { prayers, active_prayer } = buildPrayerTimesPayload(rows, date, this.clock());

    if (prayers.length === 0) {
      throw new ServiceUnavailableError(
        'PRAYER_TIMES_UNAVAILABLE',
        'Prayer times are not set for this date',
      );
    }

    return { masjid_id: masjidId, date, prayers, active_prayer };
  }
}
