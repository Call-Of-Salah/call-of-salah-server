import type { AccountStatus, AccountType } from '../../../generated/prisma/enums.js';
import type { UserModel } from '../../../generated/prisma/models.js';

export interface CreateUserInput {
  authUid: string;
  accountType: AccountType;
  status: AccountStatus;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  dateOfBirth: Date;
  phoneNumber?: string | null;
  masjidId: string;
}

export interface UserRepository {
  findById(id: string): Promise<UserModel | null>;
  findByAuthUid(authUid: string): Promise<UserModel | null>;
  create(input: CreateUserInput): Promise<UserModel>;
}
