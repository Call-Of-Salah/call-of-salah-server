import type { MasjidModel } from '../../../generated/prisma/models.js';

export interface MasjidRepository {
  findById(id: string): Promise<MasjidModel | null>;
  findActive(params: { search?: string | undefined }): Promise<MasjidModel[]>;
}
