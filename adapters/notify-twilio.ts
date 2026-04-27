import { Twilio } from 'twilio';
import { INotificationProvider } from '../contracts/notifications';

export class TwilioAdapter implements INotificationProvider {
  private client: Twilio;
  private fromNumber: string;

  constructor(sid: string, token: string, from: string) {
    this.client = new Twilio(sid, token);
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

  async sendEmail() {
    throw new Error('Twilio adapter does not support email. Use SendGridAdapter instead.');
  }
}
