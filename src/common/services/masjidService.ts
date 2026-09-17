import type { MasjidModel } from '../../generated/prisma/models.js';
import type { MasjidRepository } from '../repositories/interfaces/index.js';

export class MasjidService {
  constructor(private readonly masajid: MasjidRepository) {}

  async getMasjid(id: string): Promise<MasjidModel | null> {
    return this.masajid.findById(id);
  }
}
