import type { PushProvider } from '../types.js';

/** Firebase Cloud Messaging — push only (Architecture v2). */
export class FcmPushProvider implements PushProvider {
  async send(_params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    channelId?: string;
  }): Promise<{ successCount: number; failureCount: number }> {
    throw new Error('FcmPushProvider.send not implemented');
  }
}
