import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export interface AccessTokenClaims {
  sub: string;
}

export interface JwtVerifier {
  verify(token: string): Promise<AccessTokenClaims>;
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
}

export interface SupabaseJwtConfig {
  jwksUrl: string;
  jwtIssuer: string;
  jwtAudience: string;
}

export function createRemoteSupabaseJwtVerifier(supabase: SupabaseJwtConfig): SupabaseJwtVerifier {
  return new SupabaseJwtVerifier(createRemoteJWKSet(new URL(supabase.jwksUrl)), {
    issuer: supabase.jwtIssuer,
    audience: supabase.jwtAudience,
  });
}
