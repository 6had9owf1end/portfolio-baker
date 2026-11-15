// === ЧАСТИНА 1. КОНВЕРТЕР ВЕЛИЧИН (маса, варіант 1) ===
 
// Довідник одиниць: скільки базових одиниць (кг) міститься в одній одиниці
const units = {
  "г": 0.001,
  "кг": 1,
  "т": 1000,
  "унція": 0.028349523125,
  "фунт": 0.45359237
};
 
function convert(value, from, to) {
  const inBase = value * units[from]; // переводимо в базові одиниці
  return inBase / units[to];          // переводимо з базових у цільові
}
 
// Перевірка логіки конвертації у консолі браузера:
console.log("Тест конвертера 1:", convert(2, "кг", "г"));
console.log("Тест конвертера 2:", convert(1, "кг", "фунт"));
 
function parseValue(text) {
  const normalized = text.trim().replace(",", ".");
  if (normalized === "") {
    return { error: "Введіть значення." };
  }
  const number = Number(normalized);
  if (!Number.isFinite(number)) {
    return { error: "Введіть коректне число, наприклад 5,5." };
  }
  if (number < 0) {
    return { error: "Значення не може бути від’ємним." };
  }
  return { number: number };
}
 
// П'ять обов'язкових тестів parseValue у консолі:
console.log('parseValue("5,5"):', parseValue("5,5"));
console.log('parseValue(""):', parseValue(""));
console.log('parseValue("abc"):', parseValue("abc"));
console.log('parseValue("-3"):', parseValue("-3"));
console.log('parseValue(" 12 "):', parseValue(" 12 "));
 
const form = document.querySelector("#converter");
const valueInput = document.querySelector("#value");
const fromSelect = document.querySelector("#from");
const toSelect = document.querySelector("#to");
const resultBox = document.querySelector("#conv-result");
 
// Заповнюємо обидва випадаючі списки одиницями з об'єкта units циклом for...in
for (const name in units) {
  fromSelect.add(new Option(name, name));
  toSelect.add(new Option(name, name));
}
toSelect.selectedIndex = 1; // обираємо другу одиницю за замовчуванням
 
form.addEventListener("submit", (event) => {
  event.preventDefault(); // скасовуємо перезавантаження сторінки
  const parsed = parseValue(valueInput.value);
  if (parsed.error) {
    resultBox.textContent = parsed.error;
    return;
  }
  const result = convert(parsed.number, fromSelect.value, toSelect.value);
  const pretty = result.toLocaleString("uk-UA", { maximumFractionDigits: 4 });
  resultBox.textContent = `${parsed.number} ${fromSelect.value} = ${pretty} ${toSelect.value}`;
});
 
// === ЧАСТИНА 2. КАТАЛОГ ТОВАРІВ ===
 
// Константи варіанта 1
const PRICE_LIMIT = 300; // поріг ціни для фільтра «Дорожчі за поріг», грн
const DISCOUNT = 5;      // знижка, %
const LOW_STOCK = 3;     // межа «закінчується», шт.
 
// Набір даних (10 товарів за темою варіанта)
const products = [
  { id: 1, name: "Торт «Наполеон» класичний", category: "Торти", price: 650, qty: 4, rating: 4.9 },
  { id: 2, name: "Круасан мигдалевий", category: "Випічка", price: 95, qty: 18, rating: 4.8 },
  { id: 3, name: "Набір макаронс (12 шт.)", category: "Десерти", price: 540, qty: 0, rating: 4.7 },
  { id: 4, name: "Чізкейк Нью-Йорк", category: "Торти", price: 720, qty: 2, rating: 4.6 },
  { id: 5, name: "Еклер ванільний", category: "Тістечка", price: 85, qty: 25, rating: 4.5 },
  { id: 6, name: "Тарт лимонний з меренгою", category: "Тістечка", price: 140, qty: 3, rating: 4.4 },
  { id: 7, name: "Торт «Червоний оксамит»", category: "Торти", price: 820, qty: 0, rating: 4.9 },
  { id: 8, name: "Штрудель яблучний", category: "Випічка", price: 210, qty: 7, rating: 4.3 },
  { id: 9, name: "Набір трюфелів ручної роботи", category: "Десерти", price: 480, qty: 5, rating: 4.8 },
  { id: 10, name: "Панетоне святковий", category: "Випічка", price: 590, qty: 1, rating: 4.7 }
];
 
function formatMoney(amount) {
  return amount.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " грн";
}
 
function priceWithDiscount(price) {
  return price * (100 - DISCOUNT) / 100;
}
 
function getStatus(qty) {
  if (qty === 0) {
    return "немає в наявності";
  } else if (qty <= LOW_STOCK) {
    return "закінчується";
  } else {
    return "є в наявності";
  }
}
 
// map: новий масив із додатковим полем discounted (products не змінюється)
function addDiscount(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    qty: product.qty,
    rating: product.rating,
    discounted: priceWithDiscount(product.price)
  };
}
 
const catalog = products.map(addDiscount);
console.table(catalog);
 
const tbody = document.querySelector("#products-body");
const summary = document.querySelector("#summary");
 
// Виведення таблиці циклом for...of
function renderTable(list) {
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Нічого не знайдено</td></tr>';
    return;
  }
  let rows = "";
  for (const item of list) {
    rows += `<tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${formatMoney(item.price)}</td>
      <td>${formatMoney(item.discounted)}</td>
      <td>${item.qty}</td>
      <td>${getStatus(item.qty)}</td>
    </tr>`;
  }
  tbody.innerHTML = rows;
}
 
// reduce: підсумки під таблицею
function renderSummary(list) {
  if (list.length === 0) {
    summary.textContent = "Немає товарів для розрахунку підсумків.";
    return;
  }
  const totalValue = list.reduce((sum, item) => sum + item.price * item.qty, 0);
  const avgRating = list.reduce((sum, item) => sum + item.rating, 0) / list.length;
  const maxPrice = list.reduce((max, item) => (item.price > max ? item.price : max), 0);
 
  summary.textContent =
    `Товарів: ${list.length}. ` +
    `Вартість залишків: ${formatMoney(totalValue)}. ` +
    `Середній рейтинг: ${avgRating.toFixed(2)}. ` +
    `Найвища ціна: ${formatMoney(maxPrice)}.`;
}
 
function show(list) {
  renderTable(list);
  renderSummary(list);
}
 
// Перший показ повного каталогу
show(catalog);
 
// Делегування подій: один обробник на панель кнопок
const toolbar = document.querySelector(".toolbar");
toolbar.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (!action) return; // клік повз кнопку
 
  let list = catalog;
  if (action === "expensive") {
    list = catalog.filter((item) => item.price > PRICE_LIMIT);
  } else if (action === "available") {
    list = catalog.filter((item) => item.qty > 0);
  } else if (action === "sort-asc") {
    list = catalog.slice().sort((a, b) => a.price - b.price);
  } else if (action === "sort-desc") {
    list = catalog.slice().sort((a, b) => b.price - a.price);
  }
  show(list);
});
 
// Підрахунок товарів у кожній категорії через reduce
const countByCategory = catalog.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1;
  return acc;
}, {});
console.log("Кількість товарів за категоріями:", countByCategory);
