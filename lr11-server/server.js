import express from 'express';
import path from 'node:path';
import mongoose from 'mongoose';
import Cake from './models/Cake.js';
 
const app = express();
const PORT = Number(process.env.PORT) || 3001;
 
if (!process.env.MONGODB_URI) {
  console.error('Не задано MONGODB_URI. Створіть файл .env за зразком .env.example і запустіть: npm run dev');
  process.exit(1);
}
 
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
 
// Тип логу 1: час ISO, метод, URL
function logger(req, res, next) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
}
 
app.use(logger);
app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, 'public')));
 
app.get('/api/cakes', async (req, res) => {
  const { q, limit } = req.query;
  const filter = {};
  if (q && String(q).trim()) {
    filter.title = { $regex: escapeRegex(String(q).trim()), $options: 'i' };
  }
  let query = Cake.find(filter).sort({ createdAt: -1 });
  const max = Number(limit);
  if (Number.isInteger(max) && max > 0) {
    query = query.limit(max);
  }
  res.json(await query);
});
 
app.get('/api/cakes/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Некоректний формат id' });
  }
  const cake = await Cake.findById(id);
  if (!cake) {
    return res.status(404).json({ error: `Запис з id=${id} не знайдено` });
  }
  res.json(cake);
});
 
app.post('/api/cakes', async (req, res) => {
  const { title, flavor, price } = req.body ?? {};
  const cake = await Cake.create({ title, flavor, price });
  res.status(201).json(cake);
});
 
app.get('/api/error', () => {
  throw new Error('Тестова помилка сервера');
});
 
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено', path: req.originalUrl });
});
 
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Дані не пройшли перевірку',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некоректний JSON у тілі запиту' });
  }
  const status = err.status ?? 500;
  res.status(status).json({
    error: status === 500 ? 'Внутрішня помилка сервера' : err.message,
  });
});
 
await mongoose.connect(process.env.MONGODB_URI);
console.log(`Підключено до бази: ${mongoose.connection.name}`);
 
app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});