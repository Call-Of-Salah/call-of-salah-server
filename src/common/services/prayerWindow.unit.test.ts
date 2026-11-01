import { describe, expect, it } from 'vitest';

import {
  addMinutesHm,
  buildPrayerTimesPayload,
  formatHmUtc,
  todayYmdInTimeZone,
  wallTimeToUtc,
} from './prayerWindow.js';

describe('prayerWindow', () => {
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

  it('opens a window at jamaat and closes 30 minutes later', () => {
    const { prayers, active_prayer } = buildPrayerTimesPayload(
      [{ prayer: 'DHUHR', jamaatTime: new Date(Date.UTC(1970, 0, 1, 14, 0, 0)) }],
      '2026-07-15',
      new Date('2026-07-15T13:10:00.000Z'),
    );

    expect(prayers).toEqual([
      { prayer: 'DHUHR', jamaat_time: '14:00', window_open: '14:00', window_close: '14:30' },
    ]);
    expect(active_prayer).toBe('DHUHR');
  });

  it('is closed at window_close', () => {
    const { active_prayer } = buildPrayerTimesPayload(
      [{ prayer: 'DHUHR', jamaatTime: new Date(Date.UTC(1970, 0, 1, 14, 0, 0)) }],
      '2026-07-15',
      new Date('2026-07-15T13:30:00.000Z'),
    );

    expect(active_prayer).toBeNull();
  });

  it('keeps an Isha window that crosses midnight on the same day', () => {
    const { prayers, active_prayer } = buildPrayerTimesPayload(
      [{ prayer: 'ISHA', jamaatTime: new Date(Date.UTC(1970, 0, 1, 23, 50, 0)) }],
      '2026-01-15',
      new Date('2026-01-16T00:05:00.000Z'),
    );

    expect(prayers[0]?.window_close).toBe('00:20');
    expect(active_prayer).toBe('ISHA');
  });
});
