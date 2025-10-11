'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';

type MessageComposerProps = {
  onMessageChange: (message: string) => void;
  disabled: boolean;
};

export default function MessageComposer({
  onMessageChange,
  disabled,
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    onMessageChange(event.target.value);
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const placeholderText = `{{${placeholder}}}`;

    const newMessage = text.substring(0, start) + placeholderText + text.substring(end);
    
    setMessage(newMessage);
    onMessageChange(newMessage);

    // Focus and move cursor after the inserted placeholder
    setTimeout(() => {
      textarea.focus();
      const newCursorPosition = start + placeholderText.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <Textarea
        ref={textareaRef}
        placeholder="Type your message here..."
        className="min-h-[150px] text-base"
        value={message}
        onChange={handleTextChange}
        disabled={disabled}
      />
      <div className="flex gap-2 flex-wrap items-center">
        <p className="text-sm text-muted-foreground self-center mr-2">
          Insert placeholder:
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertPlaceholder('name')}
          disabled={disabled}
        >
          Recipient Name
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertPlaceholder('phone')}
          disabled={disabled}
        >
          Phone Number
        </Button>
      </div>
    </div>
  );
}
