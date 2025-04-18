// Простая тестовая функция для проверки API маршрутов
export default function handler(req, res) {
  // Логируем информацию о запросе
  console.log('Test API endpoint called');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request query:', req.query);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Проверяем переменные окружения
  const apiKey = process.env.VITE_DEEPGRAM_API_KEY;
  console.log('API Key exists:', !!apiKey);
  console.log('API Key first 5 chars:', apiKey ? apiKey.substring(0, 5) + '...' : 'none');
  
  // Отправляем простой ответ
  return res.status(200).json({ 
    status: 'ok',
    message: 'Test API endpoint is working correctly',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    apiKeyExists: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 5) + '...' : 'none',
    headers: req.headers,
    query: req.query,
    nodeVersion: process.version,
    env: process.env.VERCEL ? 'Vercel' : 'Other'
  });
}
