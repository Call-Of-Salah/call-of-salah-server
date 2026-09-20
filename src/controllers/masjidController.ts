import type { Request, Response } from 'express';

import { NotFoundError } from '../common/errors.js';
import { sendSuccess } from '../common/responses.js';
import type { MasjidService } from '../common/services/index.js';
import type { GetMasjidParams } from '../routes/masajid.schema.js';

export interface MasjidControllerDeps {
  masjidService: MasjidService;
}
export function createMasjidController(deps: MasjidControllerDeps) {
  return {
    getMasjidById: async (req: Request<GetMasjidParams>, res: Response): Promise<void> => {
      const masjid = await deps.masjidService.getMasjid(req.params.masjidId);

      if (!masjid) {
        throw new NotFoundError('Masjid not found');
      }

      sendSuccess(res, {
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
      });
    },
  };
}
