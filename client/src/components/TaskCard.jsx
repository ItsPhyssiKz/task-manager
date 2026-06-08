import { useState } from "react";
import TaskForm from "./TaskForm";
import { formatDate, formatRelativeDate, isOverdue, dueDateUrgency } from "../utils";

// Checkmark icon
function CheckIcon() {
  return (
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
      <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function TaskCard({ task, index = 0, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [toggling, setToggling] = useState(false); // #12 double-click guard
  const overdue = isOverdue(task.dueDate, task.completed);
  const urgency = dueDateUrgency(task.dueDate, task.completed);

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await onToggle(task.id, task.completed);
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async (updates) => {
    await onEdit(task.id, updates);
    setEditing(false);
  };

  // Build due date class
  const dueClass = [
    "task-due",
    overdue ? "overdue" : "",
    task.completed && isOverdue(task.dueDate, false) ? "done-overdue" : "",
    !task.completed && urgency ? urgency : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={`task-card${task.completed ? " completed" : ""}${overdue ? " overdue" : ""}`}
      style={{ "--i": index }}
    >
      <div className="task-card-top">
        {/* Checkbox with double-click guard (#12) */}
        <button
          className={`task-checkbox${task.completed ? " checked" : ""}${toggling ? " toggling" : ""}`}
          onClick={handleToggle}
          disabled={toggling}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          title={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          <CheckIcon />
        </button>

        {/* Content */}
        <div className="task-main">
          <div className="task-title">{task.title}</div>
          {task.description && (
            <div className="task-description">{task.description}</div>
          )}
          <div className="task-meta">
            {task.dueDate && (
              <span
                className={dueClass}
                title={`Due ${formatDate(task.dueDate)}`}
              >
                {overdue ? "⚠ " : ""}
                {formatRelativeDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="task-actions">
          <button
            className="btn-icon"
            onClick={() => setEditing((v) => !v)}
            aria-label="Edit task"
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            className="btn-icon danger"
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Inline edit form — key forces remount when task data changes (#9) */}
      {editing && (
        <TaskForm
          key={task.updatedAt}
          isEdit
          editData={task}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}
