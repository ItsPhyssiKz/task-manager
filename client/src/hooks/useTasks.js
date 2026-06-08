import { useState, useEffect, useCallback, useMemo } from "react";
import { tasksApi } from "../api/tasks";
import { isOverdue } from "../utils";

export function useTasks(filter) {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch all tasks; filtering is done client-side so
      // stats (active / completed / overdue counts) stay accurate
      // regardless of the current filter.
      const data = await tasksApi.getAll("all");
      setAllTasks(data.tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Derive filtered view from the full list
  const tasks = useMemo(() => {
    if (filter === "active") return allTasks.filter((t) => !t.completed);
    if (filter === "completed") return allTasks.filter((t) => t.completed);
    return allTasks;
  }, [allTasks, filter]);

  // Stats always computed from the full list
  const stats = useMemo(() => ({
    activeCount: allTasks.filter((t) => !t.completed).length,
    completedCount: allTasks.filter((t) => t.completed).length,
    overdueCount: allTasks.filter((t) => isOverdue(t.dueDate, t.completed)).length,
  }), [allTasks]);

  const addTask = async (taskData) => {
    const newTask = await tasksApi.create(taskData);
    // Prepend so newest appears first (matching backend sort)
    setAllTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const toggleTask = async (id, completed) => {
    const updated = await tasksApi.update(id, { completed: !completed });
    setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const editTask = async (id, updates) => {
    const updated = await tasksApi.update(id, updates);
    setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const removeTask = async (id) => {
    await tasksApi.remove(id);
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, stats, loading, error, addTask, toggleTask, editTask, removeTask };
}
