const express = require("express");
const router = express.Router();
const store = require("../store/tasks");

// ── Validation helper ────────────────────────────────────────────────────────
function validateTaskBody(body, requireTitle = true) {
  const errors = [];

  if (requireTitle && (!body.title || !body.title.trim())) {
    errors.push("title is required and must be a non-empty string");
  }

  if (body.title !== undefined && typeof body.title !== "string") {
    errors.push("title must be a string");
  }

  // Reject explicitly setting title to empty/whitespace on updates
  if (!requireTitle && body.title !== undefined && typeof body.title === "string" && !body.title.trim()) {
    errors.push("title must not be empty when provided");
  }

  if (body.dueDate !== undefined && body.dueDate !== null) {
    const d = new Date(body.dueDate);
    if (isNaN(d.getTime())) {
      errors.push("dueDate must be a valid ISO date string or null");
    }
  }

  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    errors.push("completed must be a boolean");
  }

  return errors;
}

// ── GET /api/tasks ──────────────────────────────────────────────────────────
// Optional query param: ?status=active|completed|all (default: all)
router.get("/", (req, res) => {
  const { status } = req.query;
  let tasks = store.getAllTasks();

  if (status === "active") {
    tasks = tasks.filter((t) => !t.completed);
  } else if (status === "completed") {
    tasks = tasks.filter((t) => t.completed);
  }

  res.json({ tasks, total: tasks.length });
});

// ── GET /api/tasks/:id ──────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const task = store.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// ── POST /api/tasks ─────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const errors = validateTaskBody(req.body, true);
  if (errors.length) return res.status(400).json({ error: errors.join("; ") });

  const task = store.createTask({
    title: req.body.title.trim(),
    description: req.body.description?.trim() ?? "",
    dueDate: req.body.dueDate ?? null,
  });

  res.status(201).json(task);
});

// ── PATCH /api/tasks/:id ────────────────────────────────────────────────────
// Partial update: title, description, dueDate, completed
router.patch("/:id", (req, res) => {
  const existing = store.getTaskById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const errors = validateTaskBody(req.body, false);
  if (errors.length) return res.status(400).json({ error: errors.join("; ") });

  const allowedFields = ["title", "description", "dueDate", "completed"];
  const updates = {};
  for (const key of allowedFields) {
    if (key in req.body) {
      updates[key] =
        typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
    }
  }

  const updated = store.updateTask(req.params.id, updates);
  res.json(updated);
});

// ── DELETE /api/tasks/:id ───────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const deleted = store.deleteTask(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

module.exports = router;
