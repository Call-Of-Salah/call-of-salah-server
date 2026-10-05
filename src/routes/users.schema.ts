import { z } from 'zod';

export const meResponseSchema = z.object({
  id: z.string(),
  authUid: z.string(),
  status: z.string(),
  role: z.string(),
  masjidId: z.string(),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
