import { 
  ShadowAuthAdapter, 
  ShadowPaymentAdapter, 
  ShadowStorageAdapter, 
  ShadowNotificationAdapter,
  ShadowDataAdapter,
  ShadowAIAdapter 
} from '../adapters/shadow.js';
import { IAuthAdapter } from '../contracts/auth.js';
import { IPaymentAdapter } from '../contracts/payments.js';
import { IStorageAdapter } from '../contracts/storage.js';
import { INotificationProvider } from '../contracts/notifications.js';
import { IDataBridge } from '../contracts/data.js';
import { IAIBridge } from '../contracts/ai.js';

export class AetherSDK {
  public auth: IAuthAdapter;
  public pay: IPaymentAdapter;
  public storage: IStorageAdapter;
  public notifications: INotificationProvider;
  public data: IDataBridge;
  public ai: IAIBridge;

  constructor(env: 'development' | 'production' = 'development', private proxyUrl: string = 'http://localhost:3000') {
    this.auth = this.createProxy('auth');
    this.pay = this.createProxy('pay');
    this.storage = this.createProxy('storage');
    this.notifications = this.createProxy('notify');
    this.data = this.createProxy('data');
    this.ai = this.createProxy('ai');
    
    if (env === 'development') {
      console.log("%c[AetherBridge] Running in Shadow Mode (Mocking Active)", "color: #7c3aed; font-weight: bold;");
    }
  }

  private createProxy(bridgeName: string): any {
    return new Proxy({}, {
      get: (target, prop) => {
        return async (data: any) => {
          try {
            const res = await fetch(`${this.proxyUrl}/${bridgeName}/${String(prop)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
          } catch (e) {
            console.error(`[AetherBridge SDK] Call to ${bridgeName}.${String(prop)} failed:`, e);
            throw e;
          }
        };
      }
    });
  }
}

export const bridge = new AetherSDK();
