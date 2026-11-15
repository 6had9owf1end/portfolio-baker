"use strict";
 
// 1. Клас для HTTP-помилок (коли сервер відповів кодом 400..599)
class HttpError extends Error {
  constructor(status) {
    super(`HTTP ${status}`);
    this.name = "HttpError";
    this.status = status;
  }
}
 
// 2. Універсальна функція запиту JSON із тайм-аутом та підтримкою AbortSignal
async function fetchJson(url, options = {}) {
  const { timeoutMs = 8000, signal } = options;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = signal
    ? AbortSignal.any([timeoutSignal, signal])
    : timeoutSignal;
 
  let response;
  try {
    response = await fetch(url, { signal: combinedSignal });
  } catch (error) {
    // Якщо запит було скасовано вручну через AbortController – прокидаємо далі
    if (error.name === "AbortError") {
      throw error;
    }
    if (error.name === "TimeoutError") {
      throw new Error("Сервер не відповів вчасно. Спробуйте ще раз.");
    }
    throw new Error("Немає з'єднання з сервером. Перевірте інтернет.");
  }
 
  if (!response.ok) {
    throw new HttpError(response.status);
  }
 
  try {
    return await response.json();
  } catch {
    throw new Error("Сервер повернув некоректні дані (не у форматі JSON).");
  }
}
 
// 3. Перетворення технічної помилки на зрозуміле повідомлення для користувача
function describeError(error) {
  if (error instanceof HttpError) {
    if (error.status === 404) return "Нічого не знайдено (код 404).";
    if (error.status === 429) return "Забагато запитів. Зачекайте хвилину і спробуйте знову.";
    if (error.status >= 500) return "Помилка на боці сервісу. Спробуйте пізніше.";
    return `Сервіс відповів помилкою (код ${error.status}).`;
  }
  return error.message || "Сталася невідома помилка.";
}
 
// 4. Посилання на DOM-елементи сторінки
const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query-input");
const formError = document.querySelector("#form-error");
const statusBox = document.querySelector("#status");
const placesList = document.querySelector("#places");
const resultBox = document.querySelector("#result");
const loadMoreBtn = document.querySelector("#load-more-btn");
const favoritesBox = document.querySelector("#favorites-box");
const favoritesList = document.querySelector("#favorites-list");
 
const state = { status: "idle", message: "" };
let lastAction = null;
 
function setStatus(status, message = "") {
  state.status = status;
  state.message = message;
  renderStatus();
}
 
function renderStatus() {
  statusBox.replaceChildren();
 
  if (state.status === "loading") {
    statusBox.textContent = "Завантаження…";
  } else if (state.status === "empty") {
    statusBox.textContent = state.message; // без кнопки «Повторити»
  } else if (state.status === "error") {
    const text = document.createElement("p");
    text.textContent = state.message;
 
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.textContent = "Повторити";
    retryBtn.addEventListener("click", () => {
      if (lastAction) lastAction();
    });
 
    statusBox.append(text, retryBtn);
  }
  // Для станів "idle" та "success" область #status залишається порожньою
}
 
// ===== API: TheMealDB (варіант 1) =====
const API = {
  search: "https://www.themealdb.com/api/json/v1/1/search.php"
};
 
// ===== Додаткова функція Г: «Обране» у localStorage =====
const FAV_KEY = "lab8-favorites-1";
let favorites = loadFavorites();
 
function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
 
function saveFavorites() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  } catch {
    // ігноруємо помилку переповнення сховища
  }
}
 
function isFavorite(id) {
  return favorites.some((item) => String(item.id) === String(id));
}
 
function toggleFavorite(item) {
  if (isFavorite(item.id)) {
    favorites = favorites.filter((f) => String(f.id) !== String(item.id));
  } else {
    favorites.push(item);
  }
  saveFavorites();
  renderFavorites();
  refreshFavoriteButtons();
}
 
function renderFavorites() {
  favoritesList.replaceChildren();
  if (favorites.length === 0) {
    favoritesBox.hidden = true;
    return;
  }
  favoritesBox.hidden = false;
  for (const item of favorites) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `★ ${item.title || item.name} (натисніть, щоб видалити з обраного)`;
    btn.addEventListener("click", () => toggleFavorite(item));
    li.append(btn);
    favoritesList.append(li);
  }
}
 
// Оновлення підписів кнопок «Додати в обране» у картках результатів
function refreshFavoriteButtons() {
  for (const btn of resultBox.querySelectorAll("button[data-fav-id]")) {
    btn.textContent = isFavorite(btn.dataset.favId) ? "★ В обраному" : "☆ Додати в обране";
  }
}
 
// ===== Пошук і відображення рецептів =====
 
// Збираємо інгредієнти з полів strIngredient1..20 та strMeasure1..20
function collectIngredients(meal) {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim() !== "") {
      items.push(measure && measure.trim() !== "" ? `${name.trim()} (${measure.trim()})` : name.trim());
    }
  }
  return items;
}
 
function createMealCard(meal) {
  const card = document.createElement("article");
  card.className = "api-card";
 
  if (meal.strMealThumb) {
    const img = document.createElement("img");
    img.src = meal.strMealThumb;
    img.alt = `Фото страви: ${meal.strMeal}`;
    img.loading = "lazy";
    card.append(img);
  }
 
  const title = document.createElement("h3");
  title.textContent = meal.strMeal;
 
  const info = document.createElement("p");
  info.textContent = `Категорія: ${meal.strCategory || "—"}. Кухня: ${meal.strArea || "—"}.`;
 
  const ingredients = document.createElement("p");
  ingredients.className = "ingredients";
  const list = collectIngredients(meal);
  ingredients.textContent = list.length > 0
    ? "Інгредієнти: " + list.slice(0, 6).join(", ") + (list.length > 6 ? "…" : "")
    : "Інгредієнти не вказані.";
 
  const instructions = document.createElement("p");
  const text = (meal.strInstructions || "").trim();
  instructions.textContent = text.length > 140 ? text.slice(0, 140) + "…" : text;
 
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.dataset.favId = meal.idMeal;
  favBtn.textContent = isFavorite(meal.idMeal) ? "★ В обраному" : "☆ Додати в обране";
  favBtn.addEventListener("click", () => {
    toggleFavorite({ id: meal.idMeal, title: meal.strMeal, thumb: meal.strMealThumb || "" });
  });
 
  card.append(title, info, ingredients, instructions, favBtn);
  return card;
}
 
async function searchMeals(query) {
  lastAction = () => searchMeals(query);
  setStatus("loading");
  placesList.replaceChildren();
  resultBox.replaceChildren();
 
  try {
    const params = new URLSearchParams({ s: query });
    const data = await fetchJson(`${API.search}?${params}`);
 
    // TheMealDB повертає 200 OK і meals: null, якщо нічого не знайдено
    if (!data.meals || data.meals.length === 0) {
      setStatus("empty", `За запитом «${query}» рецептів не знайдено.`);
      return;
    }
 
    setStatus("success");
    const grid = document.createElement("div");
    grid.className = "api-grid";
    for (const meal of data.meals) {
      grid.append(createMealCard(meal));
    }
    resultBox.replaceChildren(grid);
  } catch (error) {
    if (error.name === "AbortError") return;
    if (error instanceof HttpError && error.status === 404) {
      setStatus("empty", `За запитом «${query}» нічого не знайдено.`);
      return;
    }
    setStatus("error", describeError(error));
  }
}
 
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (query.length < 2) {
    formError.textContent = "Введіть щонайменше 2 символи для пошуку.";
    queryInput.focus();
    return;
  }
  formError.textContent = "";
  searchMeals(query);
});
 
renderFavorites();
