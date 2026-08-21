/** Part 5 §8 — async badge eligibility checks after check-in. */
export class BadgeService {
  async evaluateAfterCheckin(_userId: string): Promise<{ badge_key: string; badge_name: string }[]> {
    throw new Error('BadgeService.evaluateAfterCheckin not implemented');
  }
}
