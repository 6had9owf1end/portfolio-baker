import Badge from "./Badge.jsx";
import { PRIORITY_LABELS } from "../data/todos.js";
 
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.done ? "is-done" : ""}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={`Виконано: ${todo.text}`}
      />
      <span className="text">{todo.text}</span>
      <Badge kind={todo.priority}>{PRIORITY_LABELS[todo.priority]}</Badge>
      <button type="button" onClick={() => onDelete(todo.id)}>
        Видалити
      </button>
    </li>
  );
}
 
export default TodoItem;
