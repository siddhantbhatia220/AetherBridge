import { IPaymentAdapter, PaymentSession } from '../contracts/payments.js';
import { IStorageAdapter } from '../contracts/storage.js';
import { INotificationProvider } from '../contracts/notifications.js';
import { IAuthAdapter, UserProfile } from '../contracts/auth.js';
import { IDataBridge, PhoneData } from '../contracts/data.js';
import { IAIBridge } from '../contracts/ai.js';
import fs from 'fs';
import path from 'path';
import pkg from 'google-libphonenumber';
const { PhoneNumberUtil, PhoneNumberFormat } = pkg;

export class DataPhoneNumberAdapter implements IDataBridge {
  private phoneUtil = PhoneNumberUtil.getInstance();

  async parsePhone(text: string, defaultRegion: string = 'US'): Promise<PhoneData[]> {
    const results: PhoneData[] = [];
    const phoneRegex = /(\+?\d[\d\s\-\(\)]{7,}\d)/g;
    const matches = text.match(phoneRegex) || [];

    for (const match of matches) {
      try {
        const number = this.phoneUtil.parseAndKeepRawInput(match, defaultRegion);
        const isValid = this.phoneUtil.isValidNumber(number);
        results.push({
          isValid,
          internationalFormat: isValid ? this.phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL) : match,
          nationalFormat: isValid ? this.phoneUtil.format(number, PhoneNumberFormat.NATIONAL) : match,
          countryCode: isValid ? this.phoneUtil.getRegionCodeForNumber(number) || '' : ''
        });
      } catch (e) {}
    }
    return results;
  }
}

export class ShadowAIAdapter implements IAIBridge {
  async summarize(text: string): Promise<string> {
    console.log(`[SHADOW AI] Summarizing: ${text.substring(0, 50)}...`);
    return `Summarized: ${text.substring(0, 20)}... (Shadow Mode)`;
  }
  async analyze(data: any): Promise<any> {
    console.log(`[SHADOW AI] Analyzing data...`);
    return { status: "success", insight: "This looks like interesting data." };
  }
  async generate(prompt: string): Promise<string> {
    console.log(`[SHADOW AI] Generating for: ${prompt}`);
    return `Generated response for: ${prompt} (Shadow Mode)`;
  }
  async extractDataFromImages(images: string[]): Promise<any[]> {
    console.log(`[SHADOW AI] Extracting data from ${images.length} images...`);
    return images.map((_, i) => ({
      name: `Person ${i + 1}`,
      phone: `+1 555-010${i}`,
      confidence: 0.95
    }));
  }
}

// Placeholder for real Gemini adapter (requires @google/generative-ai)
export class GeminiAIAdapter implements IAIBridge {
  constructor(private apiKey: string) {}
  async summarize(text: string): Promise<string> {
    return `[GEMINI] Summary of: ${text.substring(0, 50)}...`;
  }
  async analyze(data: any): Promise<any> {
    return { analysis: "Deep insight from Gemini" };
  }
  async generate(prompt: string): Promise<string> {
    return `[GEMINI] Responding to: ${prompt}`;
  }
  async extractDataFromImages(images: string[]): Promise<any[]> {
    // In a real implementation, you'd send base64 to Gemini Pro Vision
    return [{ name: "Extracted Name", phone: "+1 234 567 890" }];
  }
}

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

export class ShadowStorageAdapter implements IStorageAdapter {
  private storageDir = path.join(process.cwd(), 'shadow-storage');

  constructor() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async uploadFile(file: any, fileName: string) {
    const filePath = path.join(this.storageDir, fileName);
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

export class ShadowDataAdapter implements IDataBridge {
  async parsePhone(text: string): Promise<PhoneData[]> {
    console.log(`[SHADOW DATA] Extracting phone numbers from text...`);
    return [{
      isValid: true,
      internationalFormat: "+1 650-253-0000",
      nationalFormat: "(650) 253-0000",
      countryCode: "US"
    }];
  }
}
