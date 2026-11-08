import type { PrayerName } from '../../generated/prisma/enums.js';
import { addMinutesHm, formatHmUtc, wallTimeToUtc } from '../utils/dateTime.js';

export const CHECKIN_WINDOW_MINUTES = 30;

export const PRAYER_ORDER: PrayerName[] = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];

export interface PrayerWindow {
  prayer: PrayerName;
  jamaat_time: string;
  window_open: string;
  window_close: string;
}

export function buildPrayerTimesPayload(
  rows: Array<{ prayer: PrayerName; jamaatTime: Date }>,
  dateYmd: string,
  now: Date,
): { prayers: PrayerWindow[]; active_prayer: PrayerName | null } {
  const byPrayer = new Map(rows.map((row) => [row.prayer, row]));
  const prayers: PrayerWindow[] = [];
  let activePrayer: PrayerName | null = null;

  for (const prayer of PRAYER_ORDER) {
    const row = byPrayer.get(prayer);
    if (!row) {
      continue;
    }

    const jamaat = formatHmUtc(row.jamaatTime);
    const close = addMinutesHm(jamaat, CHECKIN_WINDOW_MINUTES);
    prayers.push({
      prayer,
      jamaat_time: jamaat,
      window_open: jamaat,
      window_close: close,
    });

    const openAt = wallTimeToUtc(dateYmd, jamaat);
    let closeAt = wallTimeToUtc(dateYmd, close);
    if (closeAt <= openAt) {
      closeAt = new Date(closeAt.getTime() + 24 * 60 * 60 * 1000);
    }

    if (now >= openAt && now < closeAt) {
      activePrayer = prayer;
    }
  }

  return { prayers, active_prayer: activePrayer };
}
