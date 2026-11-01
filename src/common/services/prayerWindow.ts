import type { PrayerName } from '../../generated/prisma/enums.js';

export const UK_TIME_ZONE = 'Europe/London';
export const CHECKIN_WINDOW_MINUTES = 30;

export const PRAYER_ORDER: PrayerName[] = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];

export function todayYmdInTimeZone(now: Date, timeZone = UK_TIME_ZONE): string {
  return now.toLocaleDateString('en-CA', { timeZone });
}

export function formatHmUtc(value: Date): string {
  const hours = String(value.getUTCHours()).padStart(2, '0');
  const minutes = String(value.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function addMinutesHm(hm: string, minutes: number): string {
  const [hoursPart, minsPart] = hm.split(':');
  const hours = Number(hoursPart);
  const mins = Number(minsPart);
  const dayMinutes = 24 * 60;
  const total = (((hours * 60 + mins + minutes) % dayMinutes) + dayMinutes) % dayMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Civil date + clock time in `timeZone`, as a UTC instant. */
export function wallTimeToUtc(ymd: string, hm: string, timeZone = UK_TIME_ZONE): Date {
  const asUtc = Date.parse(`${ymd}T${hm}:00.000Z`);
  const locale = new Date(asUtc).toLocaleString('sv-SE', { timeZone });
  const localeAsUtc = Date.parse(locale.replace(' ', 'T') + 'Z');
  return new Date(asUtc - (localeAsUtc - asUtc));
}

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
