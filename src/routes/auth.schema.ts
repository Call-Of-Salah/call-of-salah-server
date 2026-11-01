import { z } from 'zod';

export const registerParentBodySchema = z.object({
  first_name: z.string().min(1).max(40),
  last_name: z.string().min(1).max(40),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
  date_of_birth: z.iso.date(),
  masjid_id: z.uuid(),
  phone_number: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format')
    .optional(),
});

export type RegisterParentBody = z.infer<typeof registerParentBodySchema>;
