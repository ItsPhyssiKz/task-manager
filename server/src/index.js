require("dotenv").config();
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10kb" }));

app.use("/api/tasks", taskRoutes);

// Root — API info
app.get("/", (_req, res) => {
  res.json({
    name: "Task Manager API",
    version: "1.0.0",
    endpoints: {
      tasks: "/api/tasks",
      health: "/api/health",
    },
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Only start listening when run directly (not when imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app; // exported for testing
