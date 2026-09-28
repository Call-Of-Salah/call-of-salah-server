import type { UserModel } from '../../../generated/prisma/models.js';

export interface UserRepository {
  findById(id: string): Promise<UserModel | null>;
  findByAuthUid(authUid: string): Promise<UserModel | null>;
}
