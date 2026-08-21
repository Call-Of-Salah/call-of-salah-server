import type { SmsProvider } from '../types.js';

/** Parental consent SMS — provider TBD (Supabase / Twilio / etc.). */
export class StubSmsProvider implements SmsProvider {
  async send(toE164: string, body: string): Promise<void> {
    console.info(`[sms:stub] to=${toE164} body=${body.slice(0, 40)}…`);
  }
}
