import { MessageSquare } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/20 rounded-lg">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold font-headline text-primary">
        MessageBlast
      </h1>
    </div>
  );
}
