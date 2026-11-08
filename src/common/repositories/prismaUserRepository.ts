import { Prisma, type PrismaClient } from '../../generated/prisma/client.js';
import type { UserModel } from '../../generated/prisma/models.js';
import { ConflictError, ValidationError } from '../errors.js';
import type { CreateUserInput, UserRepository } from './interfaces/index.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByAuthUid(authUid: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { authUid } });
  }

  async create(input: CreateUserInput): Promise<UserModel> {
    try {
      return await this.prisma.user.create({ data: input });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
          if (target.includes('username')) {
            throw new ConflictError('USERNAME_TAKEN', 'Username is already taken');
          }
          throw new ConflictError('EMAIL_ALREADY_REGISTERED', 'Email is already registered');
        }
        if (error.code === 'P2003') {
          throw new ValidationError([{ path: 'masjid_id', message: 'Masjid not found' }]);
        }
      }
      throw error;
    }
  }
}
