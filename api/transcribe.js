// Серверная функция Vercel для обработки запросов к Deepgram API
// Использование нативного NodeJS http вместо fetch
import https from 'https';
import { URL } from 'url';

export default async function handler(req, res) {
  // Поддерживаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Получаем API ключ из переменных окружения
    const apiKey = process.env.VITE_DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error('API key is missing in environment variables');
      return res.status(500).json({ error: 'Deepgram API key is not configured' });
    }

    // Получаем параметры из query-строки
    const { language } = req.query;
    console.log('Language from query:', language);

    // Получаем бинарные данные из тела запроса
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    console.log('Received audio file size:', buffer.length, 'bytes');

    // Создаем параметры для запроса к Deepgram
    const params = new URLSearchParams({
      model: 'nova-3',
      language: language || 'ru',
      smart_format: 'true',
      diarize: 'false',
      punctuate: 'true',
      utterances: 'false',
      detect_language: 'false'
    });

    // Отправляем запрос к Deepgram API с использованием нативного https
    const deepgramUrl = new URL(`https://api.deepgram.com/v1/listen?${params.toString()}`);
    
    console.log('Sending request to Deepgram:', deepgramUrl.toString());
    
    // Обертываем HTTP-запрос в промис
    const deepgramResponse = await new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length
        }
      };
      
      const request = https.request(deepgramUrl, options, (response) => {
        const responseChunks = [];
        
        response.on('data', (chunk) => {
          responseChunks.push(chunk);
        });
        
        response.on('end', () => {
          const responseBody = Buffer.concat(responseChunks).toString();
          
          try {
            const parsedResponse = JSON.parse(responseBody);
            resolve({
              status: response.statusCode,
              statusText: response.statusMessage,
              data: parsedResponse
            });
          } catch (e) {
            console.error('Failed to parse Deepgram response:', e);
            reject(new Error(`Invalid JSON response: ${responseBody.substring(0, 100)}...`));
          }
        });
      });
      
      request.on('error', (error) => {
        console.error('HTTP request error:', error);
        reject(error);
      });
      
      // Отправляем аудиофайл
      request.write(buffer);
      request.end();
    });
    
    // Проверка статуса ответа
    if (deepgramResponse.status !== 200) {
      console.error('Deepgram API error:', deepgramResponse.status, deepgramResponse.data);
      return res.status(deepgramResponse.status).json({
        error: `Deepgram API error: ${deepgramResponse.status}`,
        details: deepgramResponse.data
      });
    }
    
    // Возвращаем успешный результат
    console.log('Deepgram response received successfully');
    return res.status(200).json(deepgramResponse.data);
    
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ 
      error: error.message || 'Произошла ошибка при обработке запроса',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
