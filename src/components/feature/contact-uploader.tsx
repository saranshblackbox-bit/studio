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
import * as xlsx from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const parseXLSX = (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = xlsx.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = xlsx.utils.sheet_to_json(worksheet);

        const contacts: Contact[] = json.map((row, index) => {
          if (!row.name || !row.phone) {
            throw new Error(`Row ${index + 2} is missing 'name' or 'phone' column.`);
          }
          return {
            id: `${index + 1}`,
            name: String(row.name),
            phone: String(row.phone),
          };
        });
        resolve(contacts);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
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
  const { toast } = useToast();

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
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to parse file',
          description: error.message || 'Please check the file format and content.',
        });
        handleClear();
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
