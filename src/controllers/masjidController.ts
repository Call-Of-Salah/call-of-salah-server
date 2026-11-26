import type { Request, Response } from 'express';

import { NotFoundError } from '../common/errors.js';
import { sendSuccess } from '../common/responses.js';
import type { MasjidService } from '../common/services/index.js';
import type { GetMasjidParams, GetPrayerTimesQuery, ListMasajidQuery } from '../routes/masajid.schema.js';
import type { MasjidModel } from '../generated/prisma/models.js';

export interface MasjidControllerDeps {
  masjidService: MasjidService;
}
export function createMasjidController(deps: MasjidControllerDeps) {
  return {
    listMasajid: async (_req: Request, res: Response): Promise<void> => {
      const query = res.locals['validatedQuery'] as ListMasajidQuery;
      const masajid = await deps.masjidService.listMasajid(query);

      sendSuccess(
        res,
        masajid.map(({ masjid, distanceMiles }) => ({
          id: masjid.id,
          name: masjid.name,
          addressLine1: masjid.addressLine1,
          addressLine2: masjid.addressLine2,
          city: masjid.city,
          postcode: masjid.postcode,
          latitude: masjid.latitude,
          longitude: masjid.longitude,
          ...(distanceMiles === undefined ? {} : { distanceMiles }),
        })),
      );
    },

    getMasjidById: async (
      req: Request<GetMasjidParams>,
      res: Response,
    ): Promise<void> => {
      const masjid = await deps.masjidService.getMasjid(req.params.masjidId);

      if (!masjid) {
        throw new NotFoundError('Masjid not found');
      }

      sendSuccess(res, toMasjidResponse(masjid));
    },

    getPrayerTimes: async (
      req: Request<GetMasjidParams, unknown, unknown, GetPrayerTimesQuery>,
      res: Response,
    ): Promise<void> => {
      const result = await deps.masjidService.getPrayerTimes(req.params.masjidId, req.query.date);
      sendSuccess(res, result);
    },
  };
}

function toMasjidResponse(masjid: MasjidModel) {
  return {
    id: masjid.id,
    name: masjid.name,
    addressLine1: masjid.addressLine1,
    addressLine2: masjid.addressLine2,
    city: masjid.city,
    postcode: masjid.postcode,
    latitude: masjid.latitude,
    longitude: masjid.longitude,
    geofenceRadiusMetres: masjid.geofenceRadiusMetres,
    adminUserId: masjid.adminUserId,
    active: masjid.active,
    createdAt: masjid.createdAt.toISOString(),
  };
}
