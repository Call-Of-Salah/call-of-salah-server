import { describe, expect, it } from 'vitest';

import { loadConfig } from './config.js';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
  SUPABASE_URL: 'http://127.0.0.1:54321',
};

describe('loadConfig', () => {
  it('maps env vars into a nested config object', () => {
    expect(loadConfig(validEnv)).toEqual({
      env: 'test',
      port: 3000,
      database: { url: validEnv.DATABASE_URL },
      supabase: {
        url: 'http://127.0.0.1:54321',
        jwksUrl: 'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
        jwtIssuer: 'http://127.0.0.1:54321/auth/v1',
        jwtAudience: 'authenticated',
      },
    });
  });

  it('defaults port and env when they are omitted', () => {
    const config = loadConfig({
      DATABASE_URL: validEnv.DATABASE_URL,
      SUPABASE_URL: validEnv.SUPABASE_URL,
    });

    expect(config.port).toBe(3000);
    expect(config.env).toBe('development');
  });

  it('strips a trailing slash on SUPABASE_URL', () => {
    const config = loadConfig({
      ...validEnv,
      SUPABASE_URL: 'http://127.0.0.1:54321/',
    });

    expect(config.supabase.url).toBe('http://127.0.0.1:54321');
    expect(config.supabase.jwtIssuer).toBe('http://127.0.0.1:54321/auth/v1');
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() =>
      loadConfig({
        SUPABASE_URL: validEnv.SUPABASE_URL,
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it('rejects a missing SUPABASE_URL', () => {
    expect(() =>
      loadConfig({
        DATABASE_URL: validEnv.DATABASE_URL,
      }),
    ).toThrow(/SUPABASE_URL/);
  });

  it('rejects an invalid SUPABASE_URL', () => {
    expect(() =>
      loadConfig({
        DATABASE_URL: validEnv.DATABASE_URL,
        SUPABASE_URL: 'not-a-url',
      }),
    ).toThrow(/SUPABASE_URL must be a valid URL/);
  });
});
