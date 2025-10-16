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
import type { Contact, LogEntry, MediaFile } from '@/lib/types';
import ContactUploader from '@/components/feature/contact-uploader';
import MessageComposer from '@/components/feature/message-composer';
import SendingLog from '@/components/feature/sending-log';
import { Loader2, Send } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ClipboardPaste } from 'lucide-react';
import MediaUploader from '@/components/feature/media-uploader';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentCount, setSentCount] = useState(0);
  const { toast } = useToast();

  const handleContactsParsed = (parsedContacts: Contact[]) => {
    setContacts(parsedContacts);
    setLogs([]);
    setSentCount(0);
  };
  
  const handleStartProcess = () => {
    if (contacts.length === 0 || !message) return;

    setIsSending(true);
    const initialLogs: LogEntry[] = contacts.map((contact) => ({
      contact,
      status: 'queued',
      timestamp: new Date().toISOString(),
    }));
    setLogs(initialLogs);
  };

  const handleSendMessage = async (contact: Contact) => {
    // Personalize message
    const personalizedMessage = message
      .replace(/{{name}}/g, contact.name)
      .replace(/{{phone}}/g, contact.phone);
    
    // Sanitize phone number
    const sanitizedPhone = contact.phone.replace(/\D/g, '');

    const whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(
      personalizedMessage
    )}`;
    
    if (mediaFile) {
      try {
        const clipboardItem = new ClipboardItem({ [mediaFile.file.type]: mediaFile.file });
        await navigator.clipboard.write([clipboardItem]);
        toast({
          title: 'Media Copied to Clipboard',
          description: 'The media file has been copied. Paste it (Ctrl+V) in the WhatsApp chat.',
        });
      } catch (error) {
        console.error('Failed to copy media to clipboard:', error);
        toast({
          variant: 'destructive',
          title: 'Clipboard Error',
          description: 'Could not copy the media file to your clipboard. You may need to attach it manually.',
        });
      }
    }

    window.open(whatsappUrl, '_blank');

    setLogs(prevLogs => prevLogs.map(log => 
      log.contact.id === contact.id 
      ? { ...log, status: 'sent', timestamp: new Date().toISOString() } 
      : log
    ));

    setSentCount(prev => {
      const newCount = prev + 1;
      if (newCount === contacts.length) {
        setIsSending(false);
      }
      return newCount;
    });
  };

  const handleReset = () => {
    setIsSending(false);
    setLogs([]);
    setSentCount(0);
    // Note: contacts and message are not cleared to allow for re-sending.
  };

  const progress = contacts.length > 0 ? (sentCount / contacts.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl mb-8">
        <Logo />
      </header>
      <main className="w-full max-w-4xl space-y-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How It Works</AlertTitle>
          <AlertDescription>
            <p>1. Upload contacts, compose a message, and optionally add media.</p>
            <p>2. Click "Prepare Messages". A log will appear below.</p>
            <p>3. Click the "Send" button for each contact to open the WhatsApp app.</p>
            <p className="font-semibold mt-2">4. If you added media, paste it (Ctrl+V) into the chat. Then, manually send the message.</p>
            <p>5. Return here and repeat for the next contact.</p>
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
              disabled={isSending || logs.length > 0}
            />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 text-lg rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </span>
                Compose Message
              </CardTitle>
              <CardDescription>
                Use placeholders like {'{{name}}'}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageComposer
                onMessageChange={setMessage}
                disabled={isSending || logs.length > 0}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 text-lg rounded-full bg-primary/80 text-primary-foreground font-bold">
                  +
                </span>
                Add Optional Media
              </CardTitle>
              <CardDescription>
                (Optional) Select an image or video.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUploader
                onMediaSelected={setMediaFile}
                disabled={isSending || logs.length > 0}
              />
            </CardContent>
          </Card>
        </div>

        {logs.length === 0 ? (
          <div className="flex justify-center py-4">
            <Button
              size="lg"
              variant="default"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-12 py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform"
              onClick={handleStartProcess}
              disabled={contacts.length === 0 || !message.trim()}
            >
              <Send className="mr-2 h-6 w-6" />
              Prepare Messages for {contacts.length} Contacts
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 text-lg rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </span>
                Send Your Messages
              </CardTitle>
              <CardDescription>
                {progress < 100
                  ? 'Click "Send" for each contact below.'
                  : 'All messages have been processed.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SendingLog 
                logs={logs} 
                progress={progress}
                onSendMessage={handleSendMessage}
              />
              {progress === 100 && (
                 <div className="flex justify-center mt-6">
                    <Button onClick={handleReset} variant="outline">
                      Start New Batch
                    </Button>
                 </div>
              )}
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
