/**
 * Shared utility functions for the Task Manager client.
 */

/**
 * Returns true if a task is overdue: has a due date in the past and is not completed.
 */
export function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

/**
 * Formats an ISO date string into a human-readable format (e.g. "3 Jun 2025").
 */
export function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns a relative label for dates near today, falling back to formatDate.
 * Examples: "Today", "Tomorrow", "Yesterday", "In 3 days", "2 days ago"
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return null;
  const due = new Date(new Date(dateStr).toDateString());
  const today = new Date(new Date().toDateString());
  const diffMs = due - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return formatDate(dateStr);
}

/**
 * Returns a CSS class hint based on how soon the due date is.
 */
export function dueDateUrgency(dateStr, completed) {
  if (!dateStr || completed) return "";
  const due = new Date(new Date(dateStr).toDateString());
  const today = new Date(new Date().toDateString());
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "due-today";
  if (diffDays <= 2) return "due-soon";
  return "";
}
