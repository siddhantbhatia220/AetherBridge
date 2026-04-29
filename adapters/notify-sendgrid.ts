import { INotificationProvider } from '../contracts/notifications.js';

export class SendGridAdapter implements INotificationProvider {
  constructor(private apiKey: string, private fromEmail: string) {}

  async sendSMS(to: string, message: string): Promise<any> {
    throw new Error('SendGrid does not support SMS. Use TwilioAdapter as a fallback.');
  }

  async sendEmail(to: string, subject: string, body: string, templateId?: string): Promise<any> {
    console.log(`[SENDGRID] Sending email to ${to} with subject: ${subject}`);
    // Real implementation would use @sendgrid/mail
    return { id: `sg_${Date.now()}`, status: 'queued' };
  }
}
