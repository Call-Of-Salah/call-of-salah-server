/** Part 5 §9 — quest progress updates + Friday refresh. */
export class QuestService {
  async updateProgressAfterCheckin(_userId: string, _prayer: string): Promise<void> {
    throw new Error('QuestService.updateProgressAfterCheckin not implemented');
  }

  async runFridayRefresh(): Promise<void> {
    throw new Error('QuestService.runFridayRefresh not implemented');
  }
}
