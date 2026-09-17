import { z } from 'zod';

export const getMasjidParamsSchema = z.object({
  masjidId: z.uuid(),
});

export type GetMasjidParams = z.infer<typeof getMasjidParamsSchema>;

export const masjidResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  postcode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  geofenceRadiusMetres: z.number(),
  adminUserId: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
});

export type MasjidResponse = z.infer<typeof masjidResponseSchema>;
