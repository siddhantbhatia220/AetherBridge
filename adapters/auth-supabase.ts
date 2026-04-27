import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IAuthAdapter, UserProfile } from '../contracts/auth';

export class SupabaseAuthAdapter implements IAuthAdapter {
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async signUp(email: string, pass: string): Promise<UserProfile> {
    const { data, error } = await this.client.auth.signUp({ email, password: pass });
    if (error) throw error;
    return { id: data.user?.id || '', email: data.user?.email || '' };
  }

  async signIn(email: string, pass: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return {
      user: { id: data.user?.id || '', email: data.user?.email || '' },
      token: data.session?.access_token || '',
    };
  }

  async sendPasswordReset(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async validateSession(token: string) {
    const { data, error } = await this.client.auth.getUser(token);
    if (error) return null;
    return { id: data.user?.id || '', email: data.user?.email || '' };
  }
}
