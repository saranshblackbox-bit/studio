'use client';

import { ChangeEvent, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Contact } from '@/lib/types';
import { FileUp, Loader2, Trash2, UserRound } from 'lucide-react';

// Mock function to simulate XLSX parsing
const parseXLSX = (file: File): Promise<Contact[]> => {
  console.log('Parsing file:', file.name);
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you'd use a library like 'xlsx' or 'sheetjs' here.
      // For this simulation, we'll return a fixed set of contacts.
      const mockContacts: Contact[] = [
        { id: '1', name: 'Alice Johnson', phone: '123-456-7890' },
        { id: '2', name: 'Bob Williams', phone: '234-567-8901' },
        { id: '3', name: 'Charlie Brown', phone: '345-678-9012' },
        { id: '4', name: 'Diana Miller', phone: '456-789-0123' },
        { id: '5', name: 'Ethan Davis', phone: '567-890-1234' },
      ];
      resolve(mockContacts);
    }, 500);
  });
};

type ContactUploaderProps = {
  onContactsParsed: (contacts: Contact[]) => void;
  disabled: boolean;
};

export default function ContactUploader({
  onContactsParsed,
  disabled,
}: ContactUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsParsing(true);
      setContacts([]);
      onContactsParsed([]);
      try {
        const parsedContacts = await parseXLSX(file);
        setContacts(parsedContacts);
        onContactsParsed(parsedContacts);
      } catch (error) {
        console.error('Failed to parse file:', error);
        // Handle parsing error (e.g., show a toast notification)
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleClear = () => {
    setFileName(null);
    setContacts([]);
    onContactsParsed([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {!fileName && !isParsing ? (
        <Label
          htmlFor="file-upload"
          className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-border hover:bg-secondary transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-muted-foreground">XLSX file</p>
          </div>
          <Input
            id="file-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept=".xlsx"
            disabled={disabled || isParsing}
            ref={fileInputRef}
          />
        </Label>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            {isParsing && <Loader2 className="w-5 h-5 animate-spin" />}
            <p className="font-medium text-secondary-foreground">
              {isParsing ? `Parsing ${fileName}...` : fileName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={disabled || isParsing}
          >
            <Trash2 className="w-5 h-5" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      )}

      {contacts.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
            <UserRound className="w-5 h-5 text-primary" />
            {contacts.length} Contacts Loaded
          </h3>
          <div className="max-h-60 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
