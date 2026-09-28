import type { UserModel } from '../../generated/prisma/models.js';
import type { UserRepository } from '../repositories/interfaces/index.js';

export class UserService {
  constructor(private readonly users: UserRepository) {}

  async getUser(id: string): Promise<UserModel | null> {
    return this.users.findById(id);
  }
}
