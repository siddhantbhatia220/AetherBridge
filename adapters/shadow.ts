import { IPaymentAdapter, PaymentSession } from '../contracts/payments';
import { IStorageAdapter } from '../contracts/storage';
import { INotificationProvider } from '../contracts/notifications';

export class ShadowAuthAdapter implements IAuthAdapter {
  private users: Map<string, UserProfile> = new Map();

  async signUp(email: string, pass: string): Promise<UserProfile> {
    const user = { id: `mock_user_${Math.random().toString(36).substr(2, 9)}`, email };
    this.users.set(email, user);
    console.log(`[SHADOW AUTH] User Signed Up: ${email}`);
    return user;
  }

  async signIn(email: string, pass: string) {
    console.log(`[SHADOW AUTH] User Signed In: ${email}`);
    return { 
      user: { id: "dev_123", email }, 
      token: "dev_secret_jwt_token" 
    };
  }

  async sendPasswordReset(email: string) {
    const mockLink = `http://localhost:3000/reset?token=shadow_token_${Date.now()}`;
    console.log("-----------------------------------------");
    console.log(`[SHADOW AUTH] Reset Email "Sent" to: ${email}`);
    console.log(`[SHADOW AUTH] Click here: ${mockLink}`);
    console.log("-----------------------------------------");
  }

  async validateSession(token: string) {
    return { id: "dev_123", email: "dev@aetherbridge.local" };
  }
}

export class ShadowPaymentAdapter implements IPaymentAdapter {
  async createCustomer(email: string) {
    return `mock_cus_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initializePayment(amount: number) {
    console.log(`[SHADOW PAY] Intercepted payment request for $${amount}`);
    return {
      id: `mock_pay_${Math.random().toString(36).substr(2, 9)}`,
      clientSecret: "sh_test_12345",
      status: 'pending' as const
    };
  }

  async handleWebhook(rawBody: any, signature: string) {
    return { type: 'payment_intent.succeeded', data: { id: 'mock_pay_123' } };
  }
}

import fs from 'fs';
import path from 'path';

export class ShadowStorageAdapter implements IStorageAdapter {
  private storageDir = path.join(process.cwd(), 'shadow-storage');

  constructor() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async uploadFile(file: any, fileName: string) {
    const filePath = path.join(this.storageDir, fileName);
    // In a real Node environment, 'file' would be a Buffer from multer
    fs.writeFileSync(filePath, file);
    console.log(`[SHADOW STORAGE] File saved locally: ${filePath}`);
    return { 
      url: `http://localhost:3000/shadow-storage/${fileName}`, 
      key: fileName 
    };
  }

  async getFileUrl(key: string) {
    return `http://localhost:3000/shadow-storage/${key}`;
  }

  async deleteFile(key: string) {
    const filePath = path.join(this.storageDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[SHADOW STORAGE] File deleted locally: ${key}`);
    }
  }
}

export class ShadowNotificationAdapter implements INotificationProvider {
  async sendSMS(to: string, message: string) {
    console.log(`[SHADOW NOTIFY] SMS Sent to ${to}: ${message}`);
    return { id: `mock_sms_${Date.now()}`, status: 'sent' };
  }

  async sendEmail(to: string, subject: string, body: string) {
    console.log(`[SHADOW NOTIFY] Email Sent to ${to}: [${subject}]`);
    return { id: `mock_email_${Date.now()}`, status: 'sent' };
  }
}
