import twilio from 'twilio';
import { INotificationProvider } from '../contracts/notifications.js';

const { Twilio } = twilio;

export class TwilioAdapter implements INotificationProvider {
  private client: any;
  private fromNumber: string;

  constructor(sid: string, token: string, from: string) {
    this.client = new (Twilio as any)(sid, token);
    this.fromNumber = from;
  }

  async sendSMS(to: string, message: string) {
    const res = await this.client.messages.create({
      body: message,
      to,
      from: this.fromNumber,
    });
    return { id: res.sid, status: res.status };
  }

  async sendEmail(to: string, subject: string, body: string): Promise<{ id: string; status: string; }> {
    throw new Error('Twilio adapter does not support email. Use SendGridAdapter instead.');
  }
}
