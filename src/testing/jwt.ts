import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type CryptoKey, type JWTVerifyGetKey } from 'jose';

const TEST_KID = 'test-kan-65';

/** Matches local GoTrue (`${SUPABASE_URL}/auth/v1`). */
export const TEST_JWT_ISSUER = 'http://127.0.0.1:54321/auth/v1';
export const TEST_JWT_AUDIENCE = 'authenticated';

export interface TestJwtKeys {
  privateKey: CryptoKey;
  getKey: JWTVerifyGetKey;
}

export async function createTestJwtKeys(): Promise<TestJwtKeys> {
  const { privateKey, publicKey } = await generateKeyPair('ES256', { extractable: true });
  const jwk = await exportJWK(publicKey);
  jwk.kid = TEST_KID;
  jwk.alg = 'ES256';
  jwk.use = 'sig';

  return {
    privateKey,
    getKey: createLocalJWKSet({ keys: [jwk] }),
  };
}

export async function signTestAccessToken(
  privateKey: CryptoKey,
  sub: string,
  expirationTime: string | number = '5m',
  claims: { issuer?: string; audience?: string } = {},
): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: TEST_KID })
    .setSubject(sub)
    .setIssuer(claims.issuer ?? TEST_JWT_ISSUER)
    .setAudience(claims.audience ?? TEST_JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(privateKey);
}
