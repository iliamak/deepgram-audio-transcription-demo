import React, { useState } from 'react';
import { toast } from 'sonner';
import { Copy, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToWord } from '@/utils/exportToWord';

interface TranscriptionResultProps {
  transcription: string;
}

export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!transcription) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    toast.success('Текст скопирован в буфер обмена!');
  };

  const handleExportToWord = async () => {
    try {
      setIsExporting(true);
      const filename = `Транскрипция_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
      const success = await exportToWord(transcription, filename);
      
      if (success) {
        toast.success('Файл Word успешно создан и загружен!');
      } else {
        toast.error('Не удалось создать файл Word');
      }
    } catch (error) {
      console.error('Error exporting to Word:', error);
      toast.error('Произошла ошибка при экспорте');
    } finally {
      setIsExporting(false);
    }
  };

  // Функция для правильного отображения абзацев в HTML
  const formatParagraphs = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className={index > 0 ? "mt-4" : ""}>
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Результат транскрипции</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="flex items-center gap-1"
          >
            <Copy className="w-4 h-4" />
            Копировать
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportToWord}
            className="flex items-center gap-1"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Экспорт в Word
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 md:p-6 whitespace-pre-line">
        {formatParagraphs(transcription)}
      </div>
    </div>
  );
}
