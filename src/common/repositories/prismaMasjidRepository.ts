import type { PrismaClient } from '../../generated/prisma/client.js';
import type { MasjidModel } from '../../generated/prisma/models.js';
import type { MasjidRepository } from './interfaces/index.js';

export class PrismaMasjidRepository implements MasjidRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<MasjidModel | null> {
    return this.prisma.masjid.findUnique({ where: { id } });
  }

  async findActive(params: {
    search?: string | undefined;
  }): Promise<MasjidModel[]> {
    const { search } = params;

    return this.prisma.masjid.findMany({
      where: {
        active: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { postcode: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }
}
