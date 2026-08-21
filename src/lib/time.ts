/** UK local calendar helpers for streak / prayer-day boundaries (Part 5). */

const UK_TZ = 'Europe/London';

export function ukDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: UK_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function isFridayUk(date: Date = new Date()): boolean {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: UK_TZ,
    weekday: 'short',
  }).format(date);
  return weekday === 'Fri';
}
