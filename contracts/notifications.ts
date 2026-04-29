export interface INotificationProvider {
  sendSMS(to: string, message: string): Promise<{ id: string; status: string }>;
  sendEmail(to: string, subject: string, body: string, templateId?: string): Promise<{ id: string; status: string }>;
}
