import { z } from 'zod';

export interface IdentityUser {
  authUid: string;
  email: string;
  emailVerified: boolean;
}

export interface IdentityProvider {
  getUser(token: string): Promise<IdentityUser>;
}

const supabaseUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  email_confirmed_at: z.string().nullable().optional(),
});

export class SupabaseIdentityProvider implements IdentityProvider {
  constructor(
    private readonly supabaseUrl: string,
    private readonly publishableKey: string,
  ) {}

  async getUser(token: string): Promise<IdentityUser> {
    let response: Response;
    try {
      response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: this.publishableKey,
        },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new Error('PROVIDER_ERROR');
    }

    if (response.status === 401) {
      throw new Error('INVALID_TOKEN');
    }
    if (!response.ok) {
      throw new Error('PROVIDER_ERROR');
    }

    const result = supabaseUserSchema.safeParse(await response.json());
    if (!result.success) {
      throw new Error('PROVIDER_ERROR');
    }

    return {
      authUid: result.data.id,
      email: result.data.email,
      emailVerified: result.data.email_confirmed_at != null,
    };
  }
}
