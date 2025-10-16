'use client';

import { ChangeEvent, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MediaFile } from '@/lib/types';
import { FileUp, Trash2, Image, Video, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type MediaUploaderProps = {
  onMediaSelected: (media: MediaFile | null) => void;
  disabled: boolean;
};

export default function MediaUploader({
  onMediaSelected,
  disabled,
}: MediaUploaderProps) {
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'Please upload an image or a video file.',
        });
        return;
      }
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const newMediaFile = {
        file,
        previewUrl: URL.createObjectURL(file),
        type: mediaType,
      };
      setMediaFile(newMediaFile);
      onMediaSelected(newMediaFile);
    }
  };

  const handleClear = () => {
    if (mediaFile) {
      URL.revokeObjectURL(mediaFile.previewUrl);
    }
    setMediaFile(null);
    onMediaSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
       <Alert className="bg-blue-50 border-blue-200">
        <ClipboardPaste className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-800">New Feature!</AlertTitle>
          <AlertDescription className="text-blue-700">
            Select a media file here. When you send a message, it will be copied to your clipboard. Simply paste it (Ctrl+V) in WhatsApp!
          </AlertDescription>
        </Alert>

      {!mediaFile ? (
        <Label
          htmlFor="media-upload"
          className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-border hover:bg-secondary transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Upload Image/Video</span>
            </p>
            <p className="text-xs text-muted-foreground">Click or drag and drop</p>
          </div>
          <Input
            id="media-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept="image/*,video/*"
            disabled={disabled}
            ref={fileInputRef}
          />
        </Label>
      ) : (
        <div className="space-y-3">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
            {mediaFile.type === 'image' ? (
              <img src={mediaFile.previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <video src={mediaFile.previewUrl} controls className="w-full h-full object-cover" />
            )}
             <Button
                variant="destructive"
                size="icon"
                onClick={handleClear}
                disabled={disabled}
                className="absolute top-2 right-2 h-8 w-8"
            >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Remove media</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {mediaFile.type === 'image' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            <span className="truncate">{mediaFile.file.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
