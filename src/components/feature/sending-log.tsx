'use client';

import type { Contact, LogEntry, LogStatus } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Clock, Send, Hourglass } from 'lucide-react';

type SendingLogProps = {
  logs: LogEntry[];
  progress: number;
  onSendMessage: (contact: Contact) => void;
};

const StatusInfo: Record<
  LogStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    label: string;
  }
> = {
  queued: { icon: Hourglass, variant: 'secondary', label: 'Waiting' },
  sending: { icon: Loader2, variant: 'outline', label: 'Loading' }, // This status is no longer used but kept for type safety
  sent: { icon: CheckCircle2, variant: 'default', label: 'Actioned' },
  failed: { icon: XCircle, variant: 'destructive', label: 'Failed' },
};

const LogRow = ({ log, onSendMessage }: { log: LogEntry, onSendMessage: (contact: Contact) => void }) => {
  const Info = StatusInfo[log.status];
  const Icon = Info.icon;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {log.contact.name}{' '}
        <span className="text-muted-foreground text-xs">
          ({log.contact.phone})
        </span>
      </TableCell>
      <TableCell>
        <Badge
          variant={Info.variant}
          className="capitalize flex gap-1.5 items-center w-[110px] justify-center"
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{Info.label}</span>
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {log.status === 'queued' && (
          <Button size="sm" onClick={() => onSendMessage(log.contact)}>
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default function SendingLog({ logs, progress, onSendMessage }: SendingLogProps) {
  const sentCount = logs.filter(log => log.status === 'sent').length;
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-primary">
            Sending Progress ({sentCount} / {logs.length})
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <div className="max-h-96 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <LogRow key={log.contact.id} log={log} onSendMessage={onSendMessage}/>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
