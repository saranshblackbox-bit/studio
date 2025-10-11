'use client';

import type { LogEntry, LogStatus } from '@/lib/types';
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
import { CheckCircle2, XCircle, Loader2, Clock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

type SendingLogProps = {
  logs: LogEntry[];
  progress: number;
};

const StatusInfo: Record<
  LogStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    label: string;
  }
> = {
  queued: { icon: Clock, variant: 'secondary', label: 'Queued' },
  sending: { icon: Loader2, variant: 'outline', label: 'Preparing' },
  sent: { icon: Send, variant: 'default', label: 'Opened' },
  failed: { icon: XCircle, variant: 'destructive', label: 'Failed' },
};

const LogRow = ({ log }: { log: LogEntry }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }));
    // No interval needed as parent component re-renders will update the timestamp prop
  }, [log.timestamp]);


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
          className="capitalize flex gap-1.5 items-center"
        >
          <Icon
            className={`h-3.5 w-3.5 ${
              log.status === 'sending' ? 'animate-spin' : ''
            }`}
          />
          <span>{Info.label}</span>
        </Badge>
      </TableCell>
      <TableCell className="text-right text-muted-foreground text-xs">
        {timeAgo}
      </TableCell>
    </TableRow>
  );
};

export default function SendingLog({ logs, progress }: SendingLogProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-primary">
            Sending Progress
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
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <LogRow key={log.contact.id} log={log} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
