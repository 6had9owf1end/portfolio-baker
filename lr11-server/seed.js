import mongoose from 'mongoose';
import Cake from './models/Cake.js';
 
if (!process.env.MONGODB_URI) {
  console.error('Не задано MONGODB_URI. Запускайте скрипт через: npm run seed');
  process.exit(1);
}
 
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Підключено до бази: ${mongoose.connection.name}`);
 
  await Cake.deleteMany({}); // очищаємо колекцію перед повторним наповненням
 
  const created = await Cake.insertMany([
    { title: 'Прага', flavor: 'Шоколад і абрикос', price: 850 },
    { title: 'Наполеон', flavor: 'Заварний крем', price: 620 },
    { title: 'Червоний оксамит', flavor: 'Крем-чиз', price: 780 },
    { title: 'Медовик', flavor: 'Медово-сметанний', price: 560 },
    { title: 'Макаронс-асорті', flavor: 'Фісташка і малина', price: 430 },
  ]);
  console.log(`Додано початкових записів: ${created.length}`);
} catch (err) {
  console.error('Помилка під час наповнення бази даних:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

Файл .env із реальним рядком підключення навмисно не наведено і не комітиться: він внесений до .gitignore.
Хід виконання роботи