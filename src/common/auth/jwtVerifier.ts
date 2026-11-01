import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export interface AccessTokenClaims {
  sub: string;
}

export interface IdentityUser {
  authUid: string;
  email: string;
  emailVerified: boolean;
}

export interface JwtVerifier {
  verify(token: string): Promise<AccessTokenClaims>;
  getUser(token: string): Promise<IdentityUser>;
}

const ALLOWED_ALGS = ['ES256', 'ES384', 'RS256', 'RS384'] as const;

export interface JwtVerifyConstraints {
  issuer?: string;
  audience?: string;
}

/**
 * Verifies a Supabase (or test) access token against a JWKS getter.
 * HS256 is rejected by omitting it from `algorithms`.
 */
export class SupabaseJwtVerifier implements JwtVerifier {
  constructor(
    private readonly getKey: JWTVerifyGetKey,
    private readonly constraints: JwtVerifyConstraints = {},
    private readonly supabaseUrl: string,
    private readonly publishableKey: string,
  ) {}

  async verify(token: string): Promise<AccessTokenClaims> {
    const { payload } = await jwtVerify(token, this.getKey, {
      algorithms: [...ALLOWED_ALGS],
      ...(this.constraints.issuer ? { issuer: this.constraints.issuer } : {}),
      ...(this.constraints.audience ? { audience: this.constraints.audience } : {}),
    });

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new Error('missing sub');
    }

    return { sub: payload.sub };
  }

  async getUser(token: string): Promise<IdentityUser> {
    let response: Response;
    try {
      response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: this.publishableKey,
        },
      });
    } catch {
      throw new Error('Identity provider unreachable');
    }

    if (!response.ok) {
      throw new Error(`Supabase /auth/v1/user returned ${response.status}`);
    }

    const data = (await response.json()) as {
      id: string;
      email: string;
      email_confirmed_at: string | null | undefined;
    };

    return {
      authUid: data.id,
      email: data.email,
      emailVerified: data.email_confirmed_at != null,
    };
  }
}

export interface SupabaseJwtConfig {
  url: string;
  jwksUrl: string;
  jwtIssuer: string;
  jwtAudience: string;
  publishableKey: string;
}

export function createRemoteSupabaseJwtVerifier(supabase: SupabaseJwtConfig): SupabaseJwtVerifier {
  return new SupabaseJwtVerifier(
    createRemoteJWKSet(new URL(supabase.jwksUrl)),
    { issuer: supabase.jwtIssuer, audience: supabase.jwtAudience },
    supabase.url,
    supabase.publishableKey,
  );
}
