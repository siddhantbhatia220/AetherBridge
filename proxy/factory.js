import fs from 'fs';
import yaml from 'js-yaml';
import { StripeAdapter } from '../adapters/payments-stripe.js';
import { ShadowPaymentAdapter, ShadowAuthAdapter, ShadowNotificationAdapter } from '../adapters/shadow.js';
import { TwilioAdapter } from '../adapters/notify-twilio.js';

export class ProviderFactory {
  static createPaymentProvider(config) {
    if (config.mode === 'production' && config.services.payments.provider === 'stripe') {
      return new StripeAdapter(process.env.STRIPE_SECRET_KEY);
    }
    return new ShadowPaymentAdapter();
  }

  static createAuthProvider(config) {
    // For now, always returning shadow as placeholder for Supabase/Auth0
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
