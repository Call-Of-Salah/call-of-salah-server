import type { UserRecord, UserRepository } from './interfaces/index.js';

export class InMemoryUserRepository implements UserRepository {
  private readonly rows = new Map<string, UserRecord>([
    ['1', { id: '1', email: 'someone@example.com' }],
  ]);

  async findById(id: string): Promise<UserRecord | null> {
    return this.rows.get(id) ?? null;
  }
}
