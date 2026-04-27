export type PaymentSession = {
  id: string;
  clientSecret: string;
  status: 'pending' | 'success' | 'failed';
};

export interface IPaymentAdapter {
  createCustomer(email: string): Promise<string>;
  initializePayment(amount: number, currency: string, customerId: string): Promise<PaymentSession>;
  handleWebhook(rawBody: any, signature: string): Promise<any>;
}
