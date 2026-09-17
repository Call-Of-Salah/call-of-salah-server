import type { UserRecord } from './userRecord.js';

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
}
