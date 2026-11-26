import type { PrayerName } from '../../generated/prisma/enums.js';
import type { MasjidModel } from '../../generated/prisma/models.js';
import type { PrayerWindowConfig } from '../config.js';
import { NotFoundError, ServiceUnavailableError } from '../errors.js';
import type { MasjidPrayerTimeRepository, MasjidRepository } from '../repositories/interfaces/index.js';
import { todayYmdInTimeZone } from '../utils/dateTime.js';
import { buildPrayerTimesPayload, DEFAULT_PRAYER_WINDOW, type PrayerWindow } from './prayerWindow.js';

export interface PrayerTimesResult {
  masjid_id: string;
  date: string;
  prayers: PrayerWindow[];
  active_prayer: PrayerName | null;
}

export interface MasjidListResult {
  masjid: MasjidModel;
  distanceMiles?: number;
}

const EARTH_RADIUS_MILES = 3958.7613;

export class MasjidService {
  constructor(
    private readonly masajid: MasjidRepository,
    private readonly prayerTimes: MasjidPrayerTimeRepository,
    private readonly window: PrayerWindowConfig = DEFAULT_PRAYER_WINDOW,
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
    const { prayers, active_prayer } = buildPrayerTimesPayload(rows, date, this.clock(), this.window);

    if (prayers.length === 0) {
      throw new ServiceUnavailableError(
        'PRAYER_TIMES_UNAVAILABLE',
        'Prayer times are not set for this date',
      );
    }

    return { masjid_id: masjidId, date, prayers, active_prayer };
  }

  async listMasajid(params: {
    search?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
  }): Promise<MasjidListResult[]> {
    const masajid = await this.masajid.findActive({ search: params.search });
    const { latitude, longitude } = params;

    if (latitude === undefined || longitude === undefined) {
      return masajid.map((masjid) => ({ masjid }));
    }

    return masajid
      .map((masjid) => ({
        masjid,
        distanceMiles: distanceInMiles(
          latitude,
          longitude,
          masjid.latitude,
          masjid.longitude,
        ),
      }))
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .map(({ masjid, distanceMiles }) => ({
        masjid,
        distanceMiles: Math.round(distanceMiles * 100) / 100,
      }));
  }
}

function distanceInMiles(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDifference = toRadians(latitude2 - latitude1);
  const longitudeDifference = toRadians(longitude2 - longitude1);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_MILES *
    Math.asin(Math.sqrt(Math.min(1, haversine)))
  );
}
