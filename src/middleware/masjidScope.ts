import type { NextFunction, Request, Response } from 'express';

/** Auto-scope admin queries to the admin's masjid_id (Architecture §4.1 stage 5). */
export function masjidScope(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.masjidId) {
    resLocalsMasjid(req, req.user.masjidId);
  }
  next();
}

function resLocalsMasjid(req: Request, masjidId: string): void {
  (req as Request & { masjidScopeId?: string }).masjidScopeId = masjidId;
}
