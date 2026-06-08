const { v4: uuidv4 } = require("uuid");

// In-memory store — replace with JSON file or SQLite for persistence
let tasks = [];

/**
 * Returns all tasks sorted by createdAt descending (newest first).
 */
function getAllTasks() {
  return [...tasks].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Returns a single task by id, or undefined if not found.
 */
function getTaskById(id) {
  return tasks.find((t) => t.id === id);
}

/**
 * Creates and persists a new task.
 * @param {{ title: string, description?: string, dueDate?: string }} data
 */
function createTask({ title, description = "", dueDate = null }) {
  const task = {
    id: uuidv4(),
    title,
    description,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

/**
 * Updates an existing task. Only the provided fields are changed.
 */
function updateTask(id, updates) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...updates,
    id: tasks[index].id,       // id is immutable
    createdAt: tasks[index].createdAt, // createdAt is immutable
    updatedAt: new Date().toISOString(),
  };
  return tasks[index];
}

/**
 * Deletes a task by id. Returns true if deleted, false if not found.
 */
function deleteTask(id) {
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  return tasks.length < before;
}

// Expose a way to reset the store (used in tests)
function _resetStore(seed = []) {
  tasks = seed;
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask, _resetStore };
