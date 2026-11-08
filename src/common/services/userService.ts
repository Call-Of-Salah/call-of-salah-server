import { AccountStatus, AccountType } from '../../generated/prisma/enums.js';
import type { UserModel } from '../../generated/prisma/models.js';
import type { JwtVerifier } from '../auth/jwtVerifier.js';
import { ForbiddenError, ServiceUnavailableError, UnauthorizedError, ValidationError } from '../errors.js';
import type { IdentityProvider } from '../auth/supabaseIdentityProvider.js';
import type { MasjidRepository, UserRepository } from '../repositories/interfaces/index.js';
import type { RegisterParentBody } from '../../routes/auth.schema.js';

export interface RegisterParentInput extends RegisterParentBody {
  token: string;
}

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtVerifier: JwtVerifier,
    private readonly identityProvider: IdentityProvider,
    private readonly masajid: MasjidRepository,
  ) {}

  async getUser(id: string): Promise<UserModel | null> {
    return this.users.findById(id);
  }

  async registerParent(input: RegisterParentInput): Promise<UserModel> {
    let claims;
    try {
      claims = await this.jwtVerifier.verify(input.token);
    } catch {
      throw new UnauthorizedError('INVALID_TOKEN', 'Supabase token invalid or expired');
    }

    let identity;
    try {
      identity = await this.identityProvider.getUser(input.token);
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_TOKEN') {
        throw new UnauthorizedError('INVALID_TOKEN', 'Supabase token invalid or expired');
      }
      throw new ServiceUnavailableError('IDENTITY_PROVIDER_UNAVAILABLE', 'Identity provider unavailable');
    }

    if (!identity.emailVerified) {
      throw new ForbiddenError('EMAIL_NOT_VERIFIED', 'Email address has not been verified');
    }

    const masjid = await this.masajid.findById(input.masjid_id);
    if (!masjid || !masjid.active) {
      throw new ValidationError([{ path: 'masjid_id', message: 'Masjid not found or inactive' }]);
    }

    return this.users.create({
      authUid: claims.sub,
      accountType: AccountType.PARENT,
      status: AccountStatus.PENDING_ID_VERIFICATION,
      displayName: input.display_name,
      email: identity.email,
      masjidId: input.masjid_id,
    });
  }
}
