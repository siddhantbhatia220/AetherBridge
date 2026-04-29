import fs from 'fs';
import yaml from 'js-yaml';
import { StripeAdapter } from '../adapters/payments-stripe.js';
import { 
  ShadowPaymentAdapter, 
  ShadowAuthAdapter, 
  ShadowNotificationAdapter, 
  ShadowStorageAdapter,
  ShadowDataAdapter,
  DataPhoneNumberAdapter,
  ShadowAIAdapter,
  GeminiAIAdapter
} from '../adapters/shadow.js';
import { TwilioAdapter } from '../adapters/notify-twilio.js';
import { S3Adapter } from '../adapters/storage-s3.js';
import { SupabaseAuthAdapter } from '../adapters/auth-supabase.js';
import { FailoverEngine } from './failover.js';

export class ProviderFactory {
  static createPaymentProvider(config) {
    const primary = (config.mode === 'production' && config.services.payments.provider === 'stripe')
      ? new StripeAdapter(process.env.STRIPE_SECRET_KEY)
      : new ShadowPaymentAdapter();

    if (config.services.payments.secondary) {
        // Simple mock for secondary (could be PayPal, etc)
        const secondary = new ShadowPaymentAdapter(); 
        return FailoverEngine.createProxy(primary, secondary, 'payments');
    }

    return primary;
  }

  static createAuthProvider(config) {
    if (config.mode === 'production' && config.services.auth.provider === 'supabase') {
      return new SupabaseAuthAdapter(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    }
    return new ShadowAuthAdapter();
  }

  static createNotificationProvider(config) {
    if (config.mode === 'production' && config.services.notifications?.provider === 'twilio') {
      return new TwilioAdapter(
        process.env.TWILIO_SID,
        process.env.TWILIO_TOKEN,
        process.env.TWILIO_FROM
      );
    }
    return new ShadowNotificationAdapter();
  }

  static createStorageProvider(config) {
    if (config.mode === 'production' && config.services.storage.provider === 's3') {
      return new S3Adapter(
        process.env.AWS_REGION,
        process.env.AWS_BUCKET,
        process.env.AWS_ACCESS_KEY,
        process.env.AWS_SECRET_KEY
      );
    }
    return new ShadowStorageAdapter();
  }

  static createDataProvider(config) {
    if (config.mode === 'production' && config.services.data?.provider === 'libphonenumber') {
      return new DataPhoneNumberAdapter();
    }
    return new ShadowDataAdapter();
  }

  static createAIProvider(config) {
    if (config.mode === 'production' && config.services.ai?.provider === 'gemini') {
      return new GeminiAIAdapter(process.env.GEMINI_API_KEY || '');
    }
    return new ShadowAIAdapter();
  }
}

export function loadConfig() {
  try {
    const fileContents = fs.readFileSync('../aether-config.yaml', 'utf8');
    return yaml.load(fileContents);
  } catch (e) {
    console.error('Failed to load AetherBridge config, falling back to defaults.');
    return { mode: 'development', services: { auth: { provider: 'shadow' }, payments: { provider: 'shadow' } } };
  }
}
