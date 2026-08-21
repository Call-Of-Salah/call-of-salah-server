import type { AuthProvider } from '../types.js';

/** Supabase Auth JWT verification — pilot auth provider. */
export class SupabaseAuthProvider implements AuthProvider {
  async verifyAccessToken(_token: string): Promise<{ sub: string; phone?: string; email?: string }> {
    throw new Error('SupabaseAuthProvider.verifyAccessToken not implemented');
  }

  async revokeSession(_token: string): Promise<void> {
    throw new Error('SupabaseAuthProvider.revokeSession not implemented');
  }
}
