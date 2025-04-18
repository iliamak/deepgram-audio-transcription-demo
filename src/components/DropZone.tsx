import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  isProcessing: boolean;
  onDrop: (acceptedFiles: File[]) => void;
  fileInfo: { name: string; size: string } | null;
}

export function DropZone({ isProcessing, onDrop, fileInfo }: DropZoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (isProcessing) return;
      onDrop(acceptedFiles);
    },
    [isProcessing, onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    disabled: isProcessing,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
      'audio/webm': ['.webm']
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50',
        isProcessing && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} disabled={isProcessing} />

      <div className="flex flex-col items-center gap-3">
        {fileInfo ? (
          <>
            <FileAudio className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">{fileInfo.name}</p>
              <p className="text-sm text-muted-foreground">{fileInfo.size}</p>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {isDragActive
                  ? 'Перетащите файл сюда'
                  : 'Кликните для загрузки или перетащите аудиофайл'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Поддерживаемые форматы: MP3, WAV, M4A, WebM
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                Максимальный размер файла: 1 ГБ
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
