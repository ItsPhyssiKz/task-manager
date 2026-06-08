const request = require("supertest");
const app = require("../src/index");
const { _resetStore } = require("../src/store/tasks");

beforeEach(() => {
  _resetStore(); // fresh store for every test
});

describe("GET /api/tasks", () => {
  it("returns an empty list initially", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it("filters by status=active", async () => {
    // create two tasks
    const r1 = await request(app)
      .post("/api/tasks")
      .send({ title: "Active task" });
    const r2 = await request(app)
      .post("/api/tasks")
      .send({ title: "Done task" });

    // mark second as complete
    await request(app)
      .patch(`/api/tasks/${r2.body.id}`)
      .send({ completed: true });

    const res = await request(app).get("/api/tasks?status=active");
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].id).toBe(r1.body.id);
  });

  // #17 — test for status=completed filter
  it("filters by status=completed", async () => {
    const r1 = await request(app)
      .post("/api/tasks")
      .send({ title: "Active task" });
    const r2 = await request(app)
      .post("/api/tasks")
      .send({ title: "Done task" });

    await request(app)
      .patch(`/api/tasks/${r2.body.id}`)
      .send({ completed: true });

    const res = await request(app).get("/api/tasks?status=completed");
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].id).toBe(r2.body.id);
    expect(res.body.tasks[0].completed).toBe(true);
  });

  it("returns all tasks when status=all", async () => {
    await request(app).post("/api/tasks").send({ title: "Task 1" });
    await request(app).post("/api/tasks").send({ title: "Task 2" });

    const res = await request(app).get("/api/tasks?status=all");
    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it("returns tasks sorted newest first", async () => {
    const r1 = await request(app).post("/api/tasks").send({ title: "First" });
    const r2 = await request(app).post("/api/tasks").send({ title: "Second" });

    const res = await request(app).get("/api/tasks");
    expect(res.body.tasks[0].id).toBe(r2.body.id);
    expect(res.body.tasks[1].id).toBe(r1.body.id);
  });
});

// #8 — test for GET /tasks/:id
describe("GET /api/tasks/:id", () => {
  it("returns a single task by id", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Find me", description: "A description" });

    const res = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Find me");
    expect(res.body.description).toBe("A description");
    expect(res.body.id).toBe(created.body.id);
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/tasks/nonexistent-id");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });
});

describe("POST /api/tasks", () => {
  it("creates a task with title only", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Buy groceries" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Buy groceries");
    expect(res.body.completed).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  it("creates a task with all fields", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({
        title: "Full task",
        description: "With description",
        dueDate: "2025-12-31",
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Full task");
    expect(res.body.description).toBe("With description");
    expect(res.body.dueDate).toBe("2025-12-31");
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  it("rejects a task with no title", async () => {
    const res = await request(app).post("/api/tasks").send({ description: "oops" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });

  // #19 — validation edge cases
  it("rejects a task with whitespace-only title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "   " });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });

  it("rejects an invalid dueDate", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Test", dueDate: "not-a-date" });
    expect(res.status).toBe(400);
  });

  it("trims title and description whitespace", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "  Trimmed  ", description: "  Cleaned  " });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Trimmed");
    expect(res.body.description).toBe("Cleaned");
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("toggles completed status", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Toggle me" });

    const toggled = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ completed: true });

    expect(toggled.status).toBe(200);
    expect(toggled.body.completed).toBe(true);
  });

  // #18 — test for editing title/description
  it("updates title and description", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Original", description: "Old desc" });

    const updated = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ title: "Updated", description: "New desc" });

    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe("Updated");
    expect(updated.body.description).toBe("New desc");
    expect(updated.body.id).toBe(created.body.id);
    // updatedAt should be different from createdAt (or at least present)
    expect(updated.body.updatedAt).toBeDefined();
  });

  it("updates dueDate", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Set due", dueDate: "2025-06-01" });

    const updated = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ dueDate: "2025-12-25" });

    expect(updated.status).toBe(200);
    expect(updated.body.dueDate).toBe("2025-12-25");
  });

  it("preserves immutable fields (id, createdAt)", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Immutable test" });

    const updated = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ id: "hacked-id", createdAt: "1970-01-01T00:00:00.000Z", title: "Changed" });

    expect(updated.status).toBe(200);
    expect(updated.body.id).toBe(created.body.id); // id unchanged
    expect(updated.body.createdAt).toBe(created.body.createdAt); // createdAt unchanged
    expect(updated.body.title).toBe("Changed");
  });

  // #19 — validation edge cases for PATCH
  it("rejects empty title on update", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Original" });

    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });

  it("rejects whitespace-only title on update", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Original" });

    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ title: "   " });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });

  it("rejects invalid completed value", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Test" });

    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ completed: "yes" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/completed/);
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app)
      .patch("/api/tasks/nonexistent-id")
      .send({ completed: true });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes an existing task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Delete me" });

    const del = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(del.status).toBe(204);

    const check = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(check.status).toBe(404);
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).delete("/api/tasks/nonexistent-id");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("404 handler", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });
});
