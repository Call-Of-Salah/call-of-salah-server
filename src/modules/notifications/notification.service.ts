/** Part 5 §10 — preference gate, daily cap, FCM dispatch. */
export class NotificationService {
  async dispatch(_params: {
    userId: string;
    type: string;
    title: string;
    body: string;
    deepLink?: string;
  }): Promise<void> {
    throw new Error('NotificationService.dispatch not implemented');
  }
}
