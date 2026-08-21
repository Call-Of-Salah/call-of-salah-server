/** Part 5 §7 — initiate session + bcrypt PIN confirm + atomic credit debit. */
export class RedemptionService {
  async initiate(_userId: string, _rewardId: string): Promise<never> {
    throw new Error('RedemptionService.initiate not implemented');
  }

  async confirm(_userId: string, _redemptionId: string, _vendorPin: string): Promise<never> {
    throw new Error('RedemptionService.confirm not implemented');
  }
}
