import { z } from 'zod';

export const getMasjidParamsSchema = z.object({
  masjidId: z.uuid(),
});

export type GetMasjidParams = z.infer<typeof getMasjidParamsSchema>;

export const getPrayerTimesQuerySchema = z.object({
  date: z.iso.date().optional(),
});

export type GetPrayerTimesQuery = z.infer<typeof getPrayerTimesQuerySchema>;

export const prayerWindowSchema = z.object({
  prayer: z.enum(['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA']),
  jamaat_time: z.string(),
  window_open: z.string(),
  window_close: z.string(),
});

export const prayerTimesResponseSchema = z.object({
  masjid_id: z.string(),
  date: z.string(),
  prayers: z.array(prayerWindowSchema),
  active_prayer: z.enum(['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA']).nullable(),
});

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

export const masjidListItemResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  postcode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distanceMiles: z.number().nonnegative().optional(),
});

export const masjidListResponseSchema = z.array(masjidListItemResponseSchema);

export const listMasajidQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
}).refine(
  ({ latitude, longitude }) =>
    (latitude === undefined) === (longitude === undefined),
  {
    message: 'Latitude and longitude must be provided together',
    path: ['latitude'],
  },
);

export type ListMasajidQuery = z.infer<typeof listMasajidQuerySchema>;

export type MasjidResponse = z.infer<typeof masjidResponseSchema>;
