import type { Language } from '@/types/language';
import type { TranscriptionResult } from '@/types/transcription';

// API-ключ Deepgram (захардкожен согласно ТЗ)
// Для реального использования замените на ваш API ключ
const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY || 'YOUR_DEEPGRAM_API_KEY';

// Максимальный размер файла (1ГБ)
export const MAX_FILE_SIZE = 1024 * 1024 * 1024; 

// Поддерживаемые форматы аудио
export const SUPPORTED_FORMATS = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  webm: 'audio/webm'
};

/**
 * Проверка валидности аудио файла
 * @param file Файл для проверки
 * @returns Валидный MIME-тип
 */
export const validateFile = (file: File) => {
  if (file.size === 0) {
    throw new Error('Файл пустой');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Размер файла превышает 1ГБ (${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB)`);
  }

  // Получаем расширение файла и проверяем его на поддержку
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const detectedMimeType = SUPPORTED_FORMATS[extension as keyof typeof SUPPORTED_FORMATS];
  const reportedMimeType = file.type;
  
  // Используем либо определенный MIME-тип (по расширению), либо репортируемый тип из файла
  const actualType = detectedMimeType || reportedMimeType;
  
  // Проверяем, входит ли тип в наш список поддерживаемых
  const validTypes = Object.values(SUPPORTED_FORMATS);
  if (!validTypes.includes(actualType)) {
    const supportedExtensions = Object.keys(SUPPORTED_FORMATS).join(', ');
    throw new Error(`Неподдерживаемый формат файла: ${actualType}. Используйте ${supportedExtensions.toUpperCase()}`);
  }

  return actualType;
};

/**
 * Форматирование транскрибированного текста
 * @param text Исходный транскрибированный текст
 * @returns Отформатированный текст с абзацами
 */
export const formatTranscribedText = (text: string): string => {
  if (!text) return '';
  
  // Разбиваем на предложения (простая эвристика)
  const sentences = text.replace(/([.!?])\s+/g, "$1\n").split("\n");
  let result = '';
  let currentParagraph = '';
  
  // Группируем предложения в абзацы
  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    
    // Если предложение очень длинное, это может быть отдельный абзац
    if (sentence.length > 150) {
      if (currentParagraph) {
        result += currentParagraph + '\n\n';
        currentParagraph = '';
      }
      result += sentence + '\n\n';
      continue;
    }
    
    currentParagraph += (currentParagraph ? ' ' : '') + sentence;
    
    // Создаем новый абзац после 2-4 предложений или когда абзац становится длинным
    if (Math.random() < 0.3 || currentParagraph.length > 300) {
      result += currentParagraph + '\n\n';
      currentParagraph = '';
    }
  }
  
  // Добавляем оставшийся текст как последний абзац
  if (currentParagraph) {
    result += currentParagraph;
  }
  
  return result.trim();
};

// Конвертируем код языка в формат Deepgram
const getDeepgramLanguage = (language: Language): string => {
  // Deepgram использует ISO 639-1 коды языков
  const languageMap: Record<Language, string> = {
    en: 'en-US',
    ru: 'ru'
  };
  
  return languageMap[language] || 'en-US';
};

/**
 * Обработка аудиофайла и получение транскрипции с помощью Deepgram
 * @param file Файл для транскрибации
 * @param language Код языка для транскрипции
 * @returns Результат транскрипции
 */
export const processAudioFile = async (file: File, language: Language = 'en'): Promise<TranscriptionResult> => {
  // Валидация файла
  validateFile(file);
  console.log("File validated and ready for processing");
  
  try {
    const deepgramLanguage = getDeepgramLanguage(language);
    
    // Создаем URL для запроса к Deepgram Nova 3
    const url = 'https://api.deepgram.com/v1/listen?model=nova-3';
    
    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('file', file);
    
    // Создаем параметры запроса
    const params = {
      language: deepgramLanguage,
      smart_format: true,
      diarize: false, // Отключаем разделение по спикерам согласно ТЗ
      punctuate: true,
      utterances: false,
      detect_language: false
    };
    
    // Добавляем параметры в URL
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, String(value));
    }
    
    // Отправляем запрос к Deepgram
    console.log("Sending file to Deepgram...");
    const response = await fetch(`${url}&${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`
      },
      body: file
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка при обработке аудио: ${response.status} ${response.statusText}. ${errorText}`);
    }
    
    // Получаем результат
    const resultData = await response.json();
    
    // Получаем текст из результата
    const text = resultData.results?.channels[0]?.alternatives[0]?.transcript || '';
    
    // Получаем длительность аудио
    const audioDuration = resultData.metadata?.duration || 0;
    
    // Форматируем текст для удобного чтения
    const formattedText = formatTranscribedText(text);
    
    // Возвращаем результат
    return {
      text: formattedText,
      audioDuration,
      language: deepgramLanguage
    };
    
  } catch (error) {
    // Улучшенная обработка ошибок
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        throw new Error('Неверный ключ API Deepgram');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Ошибка сети. Пожалуйста, проверьте подключение к интернету и попробуйте снова.');
      }
      console.error("Transcription error:", error);
      throw error;
    }
    throw new Error('Произошла непредвиденная ошибка при обработке аудио');
  }
};
