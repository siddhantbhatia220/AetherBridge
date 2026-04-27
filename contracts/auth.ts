export interface UserProfile {
  id: string;
  email: string;
  metadata?: Record<string, any>;
}

export interface IAuthAdapter {
  signUp(email: string, pass: string): Promise<UserProfile>;
  signIn(email: string, pass: string): Promise<{ user: UserProfile; token: string }>;
  sendPasswordReset(email: string): Promise<void>;
  validateSession(token: string): Promise<UserProfile | null>;
}
