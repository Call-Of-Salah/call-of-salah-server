import { AccountStatus, AccountType } from '../../generated/prisma/enums.js';
import type { UserModel } from '../../generated/prisma/models.js';
import type { JwtVerifier } from '../auth/jwtVerifier.js';
import { ForbiddenError, UnauthorizedError, ValidationError } from '../errors.js';
import type { MasjidRepository, UserRepository } from '../repositories/interfaces/index.js';
import type { RegisterParentBody } from '../../routes/auth.schema.js';

export interface RegisterParentInput extends RegisterParentBody {
  token: string;
}

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtVerifier: JwtVerifier,
    private readonly masajid: MasjidRepository,
  ) {}

  async getUser(id: string): Promise<UserModel | null> {
    return this.users.findById(id);
  }

  async registerParent(input: RegisterParentInput): Promise<UserModel> {
    let identity;
    try {
      identity = await this.jwtVerifier.getUser(input.token);
    } catch {
      throw new UnauthorizedError('INVALID_TOKEN', 'Supabase token invalid or expired');
    }

    if (!identity.emailVerified) {
      throw new ForbiddenError('EMAIL_NOT_VERIFIED', 'Email address has not been verified');
    }

    const masjid = await this.masajid.findById(input.masjid_id);
    if (!masjid || !masjid.active) {
      throw new ValidationError([{ path: 'masjid_id', message: 'Masjid not found or inactive' }]);
    }

    return this.users.create({
      authUid: identity.authUid,
      accountType: AccountType.PARENT,
      status: AccountStatus.PENDING_ID_VERIFICATION,
      firstName: input.first_name,
      lastName: input.last_name,
      username: input.username,
      email: identity.email,
      dateOfBirth: new Date(input.date_of_birth),
      phoneNumber: input.phone_number ?? null,
      masjidId: input.masjid_id,
    });
  }
}
