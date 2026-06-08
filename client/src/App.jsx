import { useState, useEffect } from "react";
import { useTasks } from "./hooks/useTasks";
import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import DeleteConfirm from "./components/DeleteConfirm";
import ToastContainer, { useToast } from "./components/Toast";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

function getInitialTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

export default function App() {
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null); // task to confirm delete
  const [actionError, setActionError] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const [theme, setTheme] = useState(getInitialTheme);

  const { tasks, stats, loading, error, addTask, toggleTask, editTask, removeTask } =
    useTasks(filter);

  // Stats are now derived from the FULL task list inside useTasks,
  // so they stay accurate regardless of the active filter (#5).
  const { activeCount, completedCount, overdueCount } = stats;
  const totalCount = activeCount + completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Sync theme to DOM + localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const getFilterCount = (value) => {
    if (value === "all") return totalCount;
    if (value === "active") return activeCount;
    if (value === "completed") return completedCount;
    return 0;
  };

  const handleAdd = async (taskData) => {
    try {
      await addTask(taskData);
      setActionError(null);
      addToast("Task created");
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      await toggleTask(id, completed);
      setActionError(null);
      addToast(completed ? "Marked active" : "Marked complete");
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleEdit = async (id, updates) => {
    try {
      await editTask(id, updates);
      setActionError(null);
      addToast("Task updated");
    } catch (err) {
      setActionError(err.message);
      throw err; // re-throw so TaskCard can keep form open
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await removeTask(deleteTarget.id);
      setActionError(null);
      addToast("Task deleted");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-row">
          <div>
            <h1>Task<span>.</span></h1>
            <p className="header-meta">
              {totalCount === 0
                ? "No tasks yet — add one above"
                : `${progressPercent}% complete`}
              {overdueCount > 0 && (
                <> · <strong>{overdueCount}</strong> overdue</>
              )}
            </p>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="progress-section">
          <div className="progress-label">
            <span>{completedCount} of {totalCount} tasks</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats chips */}
      <div className="stats-bar">
        <span className="stat-chip active">
          {activeCount} active
        </span>
        <span className="stat-chip completed">
          {completedCount} done
        </span>
        {overdueCount > 0 && (
          <span className="stat-chip overdue">
            {overdueCount} overdue
          </span>
        )}
      </div>

      {/* New task form */}
      <TaskForm onAdd={handleAdd} />

      {/* Error banner — now dismissable (#11) */}
      {(error || actionError) && (
        <div className="error-banner">
          <span>⚠ {error || actionError}</span>
          <button
            className="error-dismiss"
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter bar with counts */}
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-btn${filter === f.value ? " active" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            <span className="filter-count">{getFilterCount(f.value)}</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <SkeletonList />
      ) : tasks.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="task-list">
          {tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirm
          taskTitle={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast notifications (#15) */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

/* ── Skeleton loading ─────────────────────────────────────────────── */
function SkeletonList() {
  return (
    <div className="skeleton-list">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="skeleton-card"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="skeleton-line w70" />
          <div className="skeleton-line w45" />
          <div className="skeleton-line w25" />
        </div>
      ))}
    </div>
  );
}

/* ── Theme toggle icons ───────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ── Empty state ──────────────────────────────────────────────────── */
function EmptyState({ filter }) {
  const messages = {
    all: { icon: "📋", title: "No tasks yet", sub: "Add your first task above to get started." },
    active: { icon: "✅", title: "All caught up!", sub: "No active tasks. Enjoy the moment." },
    completed: { icon: "🎯", title: "Nothing completed yet", sub: "Finish a task and it'll appear here." },
  };
  const { icon, title, sub } = messages[filter] || messages.all;
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{sub}</p>
    </div>
  );
}
