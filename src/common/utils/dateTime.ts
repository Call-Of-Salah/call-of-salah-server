export const UK_TIME_ZONE = 'Europe/London';

/** Calendar date in `timeZone` as YYYY-MM-DD. `en-CA` is the ISO date locale, not a timezone. */
export function todayYmdInTimeZone(now: Date, timeZone = UK_TIME_ZONE): string {
  return now.toLocaleDateString('en-CA', { timeZone });
}

/** HH:mm from a Prisma TIME value, which Prisma exposes as a UTC Date. */
export function formatHmUtc(value: Date): string {
  const hours = String(value.getUTCHours()).padStart(2, '0');
  const minutes = String(value.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Add minutes to an HH:mm clock, wrapping at 24:00. */
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
