import { describe, expect, it } from 'vitest';

import { buildPrayerTimesPayload } from './prayerWindow.js';

describe('prayerWindow', () => {
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

  it('opens before jamaat when an offset is configured', () => {
    const { prayers, active_prayer } = buildPrayerTimesPayload(
      [{ prayer: 'DHUHR', jamaatTime: new Date(Date.UTC(1970, 0, 1, 14, 0, 0)) }],
      '2026-07-15',
      new Date('2026-07-15T12:55:00.000Z'),
      { durationMinutes: 30, openOffsetMinutes: 10 },
    );

    expect(prayers).toEqual([
      { prayer: 'DHUHR', jamaat_time: '14:00', window_open: '13:50', window_close: '14:30' },
    ]);
    expect(active_prayer).toBe('DHUHR');
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
