import { SupabaseAuthProvider } from './auth/supabaseAuthProvider.js';
import { PostgresCacheProvider } from './cache/postgresCacheProvider.js';
import { FcmPushProvider } from './push/fcmPushProvider.js';
import { InProcessSchedulerProvider } from './scheduler/inProcessScheduler.js';
import { StubSmsProvider } from './sms/stubSmsProvider.js';
import type {
  AuthProvider,
  CacheProvider,
  PushProvider,
  SchedulerProvider,
  SmsProvider,
} from './types.js';

export interface Providers {
  auth: AuthProvider;
  push: PushProvider;
  scheduler: SchedulerProvider;
  cache: CacheProvider;
  sms: SmsProvider;
}

/** Wire pilot implementations. Swap here when migrating providers. */
export function createProviders(): Providers {
  return {
    auth: new SupabaseAuthProvider(),
    push: new FcmPushProvider(),
    scheduler: new InProcessSchedulerProvider(),
    cache: new PostgresCacheProvider(),
    sms: new StubSmsProvider(),
  };
}
