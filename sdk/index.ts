import { ShadowAuthAdapter, ShadowPaymentAdapter, ShadowStorageAdapter } from '../adapters/shadow';
import { IAuthAdapter } from '../contracts/auth';
import { IPaymentAdapter } from '../contracts/payments';
import { IStorageAdapter } from '../contracts/storage';

class AetherSDK {
  public auth: IAuthAdapter;
  public pay: IPaymentAdapter;
  public storage: IStorageAdapter;

  constructor(env: 'development' | 'production' = 'development') {
    if (env === 'development') {
      this.auth = new ShadowAuthAdapter();
      this.pay = new ShadowPaymentAdapter();
      this.storage = new ShadowStorageAdapter();
      console.log("%c[AetherBridge] Running in Shadow Mode (Mocking Active)", "color: #7c3aed; font-weight: bold;");
    } else {
      // In production, these would be the real adapters (Stripe, etc.)
      // For now, defaulting to shadow or throw error if not implemented
      this.auth = new ShadowAuthAdapter(); 
      this.pay = new ShadowPaymentAdapter();
      this.storage = new ShadowStorageAdapter();
    }
  }
}

export const bridge = new AetherSDK((process.env.NODE_ENV as any) || 'development');
