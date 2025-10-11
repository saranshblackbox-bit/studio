export type Contact = {
  id: string;
  name: string;
  phone: string;
};

export type LogStatus = 'queued' | 'sending' | 'sent' | 'failed';

export type LogEntry = {
  contact: Contact;
  status: LogStatus;
  timestamp: string;
};
