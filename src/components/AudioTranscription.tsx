import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DropZone } from '@/components/DropZone';
import { LanguageSelector } from '@/components/LanguageSelector';
import { TranscriptionResult } from '@/components/TranscriptionResult';
import { processAudioFile } from '@/utils/audioProcessing';
import { formatTime } from '@/lib/utils';
import { useUsage } from '@/contexts/usage-context';
import { type Language } from '@/types/language';

export function AudioTranscription() {
  // Состояние компонента
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('ru');
  const [fileInfo, setFileInfo] = useState<{name: string, size: string} | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Получаем данные об использовании из контекста
  const { remainingTime, addUsage, hasReachedLimit } = useUsage();

  // Обработчик загрузки файла
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      
      if (!file) {
        return;
      }

      // Проверка на достижение лимита
      if (hasReachedLimit) {
        toast.error('Вы исчерпали бесплатный лимит в 10 минут');
        return;
      }

      // Форматирование размера файла для отображения
      const fileSize = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        
      setFileInfo({
        name: file.name,
        size: fileSize
      });

      try {
        setError(null);
        setIsProcessing(true);
        setTranscription('');
        setProgress(0);
        
        // Начинаем прогресс-бар
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 5;
          });
        }, 1000);

        // Обрабатываем файл
        const result = await processAudioFile(file, language);
        
        // Останавливаем прогресс-бар и устанавливаем 100%
        clearInterval(progressInterval);
        setProgress(100);

        // Добавляем время использования
        addUsage(result.audioDuration);
        
        // Устанавливаем результат
        setTranscription(result.text);
        toast.success('Транскрипция успешно завершена!');
        
      } catch (error) {
        console.error('Transcription error:', error);
        
        let errorMessage = 'Произошла ошибка при обработке аудио';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    },
    [language, addUsage, hasReachedLimit]
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Информация об использовании */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Осталось бесплатного времени:</span>
          <span className={`font-medium ${remainingTime < 60 ? 'text-destructive' : 'text-primary'}`}>
            {formatTime(remainingTime)}
          </span>
        </div>
        <Progress value={(remainingTime / 600) * 100} />
      </div>
      
      {/* Предупреждение о лимите */}
      {hasReachedLimit && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Вы достигли бесплатного лимита в 10 минут. Для продолжения использования перейдите на полную версию.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Выбор языка */}
      <LanguageSelector 
        language={language} 
        onLanguageChange={setLanguage} 
      />

      {/* Отображение ошибки */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Зона загрузки */}
      <DropZone 
        isProcessing={isProcessing} 
        onDrop={onDrop} 
        fileInfo={fileInfo}
      />

      {/* Индикатор прогресса */}
      {isProcessing && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2">
          <div className="w-full">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Обработка аудио...</p>
          </div>
        </div>
      )}

      {/* Результаты распознавания */}
      <TranscriptionResult transcription={transcription} />
    </div>
  );
}