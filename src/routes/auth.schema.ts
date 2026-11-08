import { z } from 'zod';

export const registerParentBodySchema = z.object({
  display_name: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[\p{L}\s'\-]+$/u, 'Display name may only contain letters, spaces, hyphens and apostrophes'),
  masjid_id: z.uuid(),
});

export type RegisterParentBody = z.infer<typeof registerParentBodySchema>;

export const registerParentResponseSchema = z.object({
  id: z.string().uuid(),
  account_type: z.literal('PARENT'),
  status: z.literal('PENDING_ID_VERIFICATION'),
});
