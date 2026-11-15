import Header from "./components/Header.jsx";
import TodoForm from "./components/TodoForm.jsx";
import Filters from "./components/Filters.jsx";
import TodoList from "./components/TodoList.jsx";
import Counter from "./components/Counter.jsx";
import { initialTodos, FILTERS } from "./data/todos.js";
import { filterTodos } from "./utils.js";
 
function App() {
  const todos = initialTodos;
  const activeFilter = "all"; // Поки що незмінний; реактивний стан додамо на ЛР № 10
  const visibleTodos = filterTodos(todos, activeFilter);
  const doneCount = todos.filter((t) => t.done).length;
 
  // Тимчасові обробники подій: повідомляють про дію користувача в консоль
  const handleAdd = (text) => console.log("Додати:", text);
  const handleToggle = (id) => console.log("Перемкнути:", id);
  const handleDelete = (id) => console.log("Видалити:", id);
  const handleFilter = (id) => console.log("Фільтр:", id);
 
  return (
    <main className="app">
      <Header
        title="Замовлення та заготовки кондитерської"
        subtitle="Компонентна версія на React (ЛР № 9)"
      />
      <TodoForm onAdd={handleAdd} />
      <Filters
        filters={FILTERS}
        activeId={activeFilter}
        onChange={handleFilter}
      />
      <TodoList
        todos={visibleTodos}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
      <Counter total={todos.length} done={doneCount} />
    </main>
  );
}
 
export default App;
