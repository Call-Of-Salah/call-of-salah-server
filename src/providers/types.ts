/**
 * Pluggable provider contracts (Architecture v2 §7.1).
 * Swap implementations without rewriting call sites.
 */

export interface AuthProvider {
  verifyAccessToken(token: string): Promise<{ sub: string; phone?: string; email?: string }>;
  revokeSession(token: string): Promise<void>;
}

export interface PushProvider {
  send(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    channelId?: string;
  }): Promise<{ successCount: number; failureCount: number }>;
}

export interface SchedulerProvider {
  schedule(name: string, cronExpression: string, timezone: string, handler: () => Promise<void>): void;
  start(): void;
  stop(): void;
}

export interface CacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  incr(key: string, ttlSeconds?: number): Promise<number>;
  sadd(key: string, member: string, ttlSeconds?: number): Promise<boolean>;
  sismember(key: string, member: string): Promise<boolean>;
  del(key: string): Promise<void>;
}

export interface SmsProvider {
  send(toE164: string, body: string): Promise<void>;
}
