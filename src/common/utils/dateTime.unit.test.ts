import { describe, expect, it } from 'vitest';

import { addMinutesHm, formatHmUtc, todayYmdInTimeZone, wallTimeToUtc } from './dateTime.js';

describe('dateTime', () => {
  it('formats TIME values as HH:mm in UTC', () => {
    expect(formatHmUtc(new Date(Date.UTC(1970, 0, 1, 14, 5, 0)))).toBe('14:05');
  });

  it('adds 30 minutes and wraps past midnight', () => {
    expect(addMinutesHm('14:00', 30)).toBe('14:30');
    expect(addMinutesHm('23:50', 30)).toBe('00:20');
  });

  it('maps UK winter wall time to UTC (GMT)', () => {
    const instant = wallTimeToUtc('2026-01-15', '14:00');
    expect(instant.toISOString()).toBe('2026-01-15T14:00:00.000Z');
  });

  it('maps UK summer wall time to UTC (BST)', () => {
    const instant = wallTimeToUtc('2026-07-15', '14:00');
    expect(instant.toISOString()).toBe('2026-07-15T13:00:00.000Z');
  });

  it('uses Europe/London for the default calendar date', () => {
    expect(todayYmdInTimeZone(new Date('2026-07-15T23:30:00.000Z'))).toBe('2026-07-16');
  });
});
