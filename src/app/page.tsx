'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Contact, LogEntry } from '@/lib/types';
import ContactUploader from '@/components/feature/contact-uploader';
import MessageComposer from '@/components/feature/message-composer';
import SendingLog from '@/components/feature/sending-log';
import { Loader2, Send } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

// Helper to simulate delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleContactsParsed = (parsedContacts: Contact[]) => {
    setContacts(parsedContacts);
    setLogs([]);
    setProgress(0);
  };

  const handleStartSending = async () => {
    if (contacts.length === 0 || !message) return;

    setIsSending(true);
    setProgress(0);

    const initialLogs: LogEntry[] = contacts.map((contact) => ({
      contact,
      status: 'queued',
      timestamp: new Date().toISOString(),
    }));
    setLogs(initialLogs);

    // Give user a moment to see the queued logs
    await sleep(500);

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.contact.id === contact.id
            ? { ...log, status: 'sending', timestamp: new Date().toISOString() }
            : log
        )
      );

      // Personalize message
      const personalizedMessage = message
        .replace(/{{name}}/g, contact.name)
        .replace(/{{phone}}/g, contact.phone);

      // Sanitize phone number
      const sanitizedPhone = contact.phone.replace(/\D/g, '');

      const whatsappUrl = `https://web.whatsapp.com/send?phone=${sanitizedPhone}&text=${encodeURIComponent(
        personalizedMessage
      )}`;

      // Open a new tab for each contact.
      window.open(whatsappUrl, '_blank');

      // There's no reliable way to know if the message was truly sent.
      // We'll mark it as 'sent' after opening the tab and waiting.
      // The user needs to manually click send and then can close the tab.
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.contact.id === contact.id
            ? { ...log, status: 'sent', timestamp: new Date().toISOString() }
            : log
        )
      );

      setProgress(((i + 1) / contacts.length) * 100);

      // Add a longer delay to give the user time to confirm the message and close the tab
      // before the app opens the next one.
      if (i < contacts.length - 1) {
        await sleep(8000); // 8-second delay
      }
    }

    setIsSending(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl mb-8">
        <Logo />
      </header>
      <main className="w-full max-w-4xl space-y-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important: How It Works</AlertTitle>
          <AlertDescription>
            <p>1. This tool will open a new WhatsApp Web tab for each contact, one by one.</p>
            <p>2. You may need to <strong>allow pop-ups</strong> from this site for it to work correctly.</p>
            <p className="font-semibold mt-2">3. In the new tab, click the "Send" button. You can then close that tab.</p>
            <p>4. The app will wait for a few seconds and then open the tab for the next contact.</p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 text-lg rounded-full bg-primary text-primary-foreground font-bold">
                1
              </span>
              Upload Contact List
            </CardTitle>
            <CardDescription>
              Upload an XLSX file with 'name' and 'phone' columns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactUploader
              onContactsParsed={handleContactsParsed}
              disabled={isSending}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 text-lg rounded-full bg-primary text-primary-foreground font-bold">
                2
              </span>
              Compose Message
            </CardTitle>
            <CardDescription>
              Write your message. Use placeholders like {'{{name}}'} to
              personalize it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MessageComposer
              onMessageChange={setMessage}
              disabled={isSending}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center py-4">
          <Button
            size="lg"
            variant="default"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-12 py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            onClick={handleStartSending}
            disabled={isSending || contacts.length === 0 || !message.trim()}
          >
            {isSending ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Send className="mr-2 h-6 w-6" />
            )}
            {isSending
              ? 'Sending...'
              : `Start Sending to ${contacts.length} Contacts`}
          </Button>
        </div>

        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 text-lg rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </span>
                Real-time Sending Log
              </CardTitle>
              <CardDescription>
                {isSending
                  ? 'Opening WhatsApp tabs. Please confirm sending in each new tab.'
                  : 'Sending process completed.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SendingLog logs={logs} progress={progress} />
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="w-full max-w-4xl mt-12 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} MessageBlast. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
