/**
 * Part 5 §4 — NFC check-in pipeline (validation + atomic awards).
 * Routes stay thin; all business rules live here.
 */
export class CheckinService {
  async submit(_input: {
    userId: string;
    tagId: string;
    clientNonce: string;
    deviceTimestamp: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    gpsAccuracyMetres?: number;
  }): Promise<never> {
    throw new Error('CheckinService.submit not implemented');
  }

  async history(
    _userId: string,
    _opts: { from?: string; to?: string; limit: number; offset: number },
  ): Promise<never> {
    throw new Error('CheckinService.history not implemented');
  }
}
