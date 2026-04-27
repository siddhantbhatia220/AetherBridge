import Stripe from 'stripe';
import { IPaymentAdapter, PaymentSession } from '../contracts/payments';

export class StripeAdapter implements IPaymentAdapter {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createCustomer(email: string) {
    const customer = await this.stripe.customers.create({ email });
    return customer.id;
  }

  async initializePayment(amount: number, currency: string, customerId: string): Promise<PaymentSession> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      status: 'pending',
    };
  }

  async handleWebhook(rawBody: any, signature: string) {
    // This would require the webhook secret from config
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  }
}
