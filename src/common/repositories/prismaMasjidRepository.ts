import type { PrismaClient } from '../../generated/prisma/client.js';
import type { MasjidModel } from '../../generated/prisma/models.js';
import type { MasjidRepository } from './interfaces/index.js';

export class PrismaMasjidRepository implements MasjidRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<MasjidModel | null> {
    return this.prisma.masjid.findUnique({ where: { id } });
  }
}
