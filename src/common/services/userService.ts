import type { UserRecord, UserRepository } from '../repositories/interfaces/index.js';

/**
 * Receives its repository rather than reaching for the container, so a test can hand it a
 * fake without `ioc` being involved at all.
 */
export class UserService {
  constructor(private readonly users: UserRepository) {}

  async getUser(id: string): Promise<UserRecord | null> {
    return this.users.findById(id);
  }
}
