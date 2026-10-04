import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is not set'),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL is not set'),
});

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  database: {
    url: string;
  };
  supabase: {
    url: string;
    jwksUrl: string;
    jwtIssuer: string;
    jwtAudience: 'authenticated';
  };
}

/**
 * Parse env into a nested config object. Callers pass `process.env` in production
 * and a plain object in tests so unit tests never depend on the real environment.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid configuration: ${details}`);
  }

  let supabaseUrl: URL;
  try {
    supabaseUrl = new URL(parsed.data.SUPABASE_URL);
  } catch {
    throw new Error('Invalid configuration: SUPABASE_URL must be a valid URL');
  }

  const supabaseOrigin = supabaseUrl.origin;

  return {
    env: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    database: {
      url: parsed.data.DATABASE_URL,
    },
    supabase: {
      url: supabaseOrigin,
      jwksUrl: `${supabaseOrigin}/auth/v1/.well-known/jwks.json`,
      jwtIssuer: `${supabaseOrigin}/auth/v1`,
      jwtAudience: 'authenticated',
    },
  };
}
