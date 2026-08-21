import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  API_VERSION: z.string().default('v1'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/call_of_salah'),
  SUPABASE_URL: z.string().default('http://localhost:54321'),
  SUPABASE_ANON_KEY: z.string().default('dev-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('dev-service-role-key'),
  SUPABASE_JWT_SECRET: z.string().default('dev-jwt-secret-change-me'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  APP_BASE_URL: z.string().default('https://app.callofsalah.com'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(raw);
}

export const env = loadEnv();

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  apiVersion: env.API_VERSION,
  isProd: env.NODE_ENV === 'production',
  corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  appBaseUrl: env.APP_BASE_URL,
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: env.SUPABASE_JWT_SECRET,
  },
  firebase: {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  /** Day boundary for streaks — 23:30 Europe/London (Part 5). */
  streakDayBoundaryHourUk: 23,
  streakDayBoundaryMinuteUk: 30,
  /** Prayer check-in window length in minutes (Part 3 / Part 6). */
  prayerWindowMinutes: 20,
} as const;
