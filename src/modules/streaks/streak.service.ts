/**
 * Part 5 §5 — main daily streak + prayer micro-streaks.
 * Day boundary: 23:30 Europe/London.
 */
export class StreakService {
  async getForUser(_userId: string): Promise<never> {
    throw new Error('StreakService.getForUser not implemented');
  }

  async updateAfterCheckin(_userId: string, _prayer: string, _prayerDate: string): Promise<never> {
    throw new Error('StreakService.updateAfterCheckin not implemented');
  }

  async runEndOfDayReset(): Promise<void> {
    throw new Error('StreakService.runEndOfDayReset not implemented');
  }
}
