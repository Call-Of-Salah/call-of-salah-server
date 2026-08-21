/**
 * Part 5 §6 — group assignment, weekly XP, Fri reset (top 3 / bottom 3).
 */
export class LeagueService {
  async getForUser(_userId: string, _tab: 'weekly' | 'alltime'): Promise<never> {
    throw new Error('LeagueService.getForUser not implemented');
  }

  async assignOnSignup(_userId: string, _masjidId: string): Promise<void> {
    throw new Error('LeagueService.assignOnSignup not implemented');
  }

  async addWeeklyXp(_userId: string, _xp: number): Promise<void> {
    throw new Error('LeagueService.addWeeklyXp not implemented');
  }

  async runWeeklyReset(): Promise<void> {
    throw new Error('LeagueService.runWeeklyReset not implemented');
  }
}
