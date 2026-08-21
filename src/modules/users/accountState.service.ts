/** Part 5 §2 — account status transitions (parental consent, ID verify, deletion). */
export class AccountStateService {
  async transition(_userId: string, _to: string, _reason?: string): Promise<void> {
    throw new Error('AccountStateService.transition not implemented');
  }
}
