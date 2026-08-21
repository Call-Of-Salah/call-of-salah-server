import type { CacheProvider } from '../types.js';

/**
 * Postgres-backed cache for pilot rate limits / nonces / counters.
 * Swap for RedisCacheProvider when Redis is reintroduced.
 */
export class PostgresCacheProvider implements CacheProvider {
  async get(_key: string): Promise<string | null> {
    throw new Error('PostgresCacheProvider.get not implemented');
  }

  async set(_key: string, _value: string, _ttlSeconds?: number): Promise<void> {
    throw new Error('PostgresCacheProvider.set not implemented');
  }

  async incr(_key: string, _ttlSeconds?: number): Promise<number> {
    throw new Error('PostgresCacheProvider.incr not implemented');
  }

  async sadd(_key: string, _member: string, _ttlSeconds?: number): Promise<boolean> {
    throw new Error('PostgresCacheProvider.sadd not implemented');
  }

  async sismember(_key: string, _member: string): Promise<boolean> {
    throw new Error('PostgresCacheProvider.sismember not implemented');
  }

  async del(_key: string): Promise<void> {
    throw new Error('PostgresCacheProvider.del not implemented');
  }
}
