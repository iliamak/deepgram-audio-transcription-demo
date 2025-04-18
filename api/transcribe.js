// Серверная функция Vercel для обработки запросов к Deepgram API
import fetch from 'node-fetch';
import { Readable } from 'stream';
import { Buffer } from 'buffer';

// Преобразование ReadableStream в Buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  // Поддерживаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Получаем API ключ из переменных окружения
    const apiKey = process.env.VITE_DEEPGRAM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Deepgram API key is not configured' });
    }

    // Получаем параметры из query-строки
    const { language } = req.query;

    // Получаем файл из тела запроса
    const buffer = await streamToBuffer(req.body);

    // Создаем URL для запроса к Deepgram
    const url = 'https://api.deepgram.com/v1/listen';
    const params = new URLSearchParams({
      model: 'nova-3',
      language: language || 'ru',
      smart_format: 'true',
      diarize: 'false',
      punctuate: 'true',
      utterances: 'false',
      detect_language: 'false'
    });

    // Отправляем запрос к Deepgram API
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'audio/mpeg'
      },
      body: buffer
    });

    // Передаем ответ от Deepgram клиенту
    const data = await response.json();
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ error: error.message });
  }
}
