export const PRIORITY_LABELS = {
  high: "високий",
  medium: "середній",
  low: "низький"
};
 
export const initialTodos = [
  { id: 1, text: "Приготувати заварний крем для еклерів", done: true, priority: "high" },
  { id: 2, text: "Замовити бельгійський темний шоколад (5 кг)", done: true, priority: "medium" },
  { id: 3, text: "Спекти бісквітні коржі на весільний торт", done: false, priority: "high" },
  { id: 4, text: "Перевірити запаси мигдалевого борошна", done: false, priority: "low" },
  { id: 5, text: "Узгодити декор капкейків із замовником", done: false, priority: "medium" },
  { id: 6, text: "Оновити сезонне меню десертів на вітрині", done: false, priority: "low" }
];
 
export const FILTERS = [
  { id: "all", label: "Усі" },
  { id: "active", label: "Активні" },
  { id: "done", label: "Виконані" }
];
