import type { PrismaClient } from '../../generated/prisma/client.js';
import type { UserModel } from '../../generated/prisma/models.js';
import type { UserRepository } from './interfaces/index.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByAuthUid(authUid: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { authUid } });
  }
}
