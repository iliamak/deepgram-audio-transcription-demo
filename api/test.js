// Простая тестовая функция для проверки API-маршрутов
export default function handler(req, res) {
  console.log('API test endpoint called');
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  
  // Возвращаем простой ответ
  res.status(200).json({ 
    status: 'ok',
    message: 'API endpoint is working',
    env: process.env.VITE_DEEPGRAM_API_KEY ? 'API key exists' : 'API key missing',
    time: new Date().toISOString()
  });
}
