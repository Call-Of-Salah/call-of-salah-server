export type PrayerName = 'FAJR' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA';
export type MicroStreakPrayer = PrayerName | 'JUMUAH';

export type QuestType =
  | 'PRAYER_COUNT'
  | 'PRAYER_STREAK'
  | 'FULL_DAY_COUNT'
  | 'TOTAL_CHECKINS'
  | 'JUMUAH_STREAK';
