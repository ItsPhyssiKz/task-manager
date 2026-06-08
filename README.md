# Task Manager

A full-stack personal task manager built with **Node.js + Express** (backend) and **React + Vite** (frontend). Developed as Exercise 1 of the Studio Graphene Full Stack Developer assessment.

Users can create, view, update, and delete tasks — with filtering by status, overdue highlighting, and an inline edit experience. No authentication; assumes a single user.

---

## Live Demo

> - **Frontend:** https://task-manager-nu-swart.vercel.app
> - **Backend:** https://task-manager-api-r2f0.onrender.com

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express | Minimal, well-understood; fast to set up REST routes cleanly |
| Frontend | React 18 + Vite | Functional components + hooks; Vite gives fast HMR in dev |
| Storage | In-memory array | Sufficient for the brief; easy to swap for SQLite (see Next Steps) |
| Styling | Plain CSS with custom properties | No build-time dependencies; full control over design tokens |
| Testing | Jest + Supertest | Meaningful integration tests on the API layer |

---

## How to Run Locally

> Assumes you have **Node.js 18+** and **npm** installed. Nothing else required.

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
npm run install:all
```

### 2. Start the backend (terminal 1)

```bash
npm run dev:server
# Server runs on http://localhost:3001
```

### 3. Start the frontend (terminal 2)

```bash
npm run dev:client
# App opens on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `localhost:3001`, so no CORS config is needed in development.

### 4. Run backend tests

```bash
npm test
```

---

## API Documentation

Base URL: `http://localhost:3001/api`

### `GET /tasks`

Returns all tasks, sorted newest first.

| Query param | Type | Values | Default |
|---|---|---|---|
| `status` | string | `all` \| `active` \| `completed` | `all` |

**Response 200**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Buy milk",
      "description": "",
      "dueDate": "2025-06-10T00:00:00.000Z",
      "completed": false,
      "createdAt": "2025-06-03T10:00:00.000Z",
      "updatedAt": "2025-06-03T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### `GET /tasks/:id`

Returns a single task.

**Response 200** — task object  
**Response 404** — `{ "error": "Task not found" }`

---

### `POST /tasks`

Creates a new task.

**Request body**
```json
{
  "title": "Buy milk",          // required
  "description": "Semi-skimmed", // optional
  "dueDate": "2025-06-10"       // optional, ISO date string or null
}
```

**Response 201** — created task object  
**Response 400** — `{ "error": "title is required..." }`

---

### `PATCH /tasks/:id`

Partial update. Send only the fields you want to change.

**Request body** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "New description",
  "dueDate": "2025-06-15",
  "completed": true
}
```

**Response 200** — updated task object  
**Response 404** — task not found  
**Response 400** — validation error

---

### `DELETE /tasks/:id`

Deletes a task permanently.

**Response 204** — no body  
**Response 404** — task not found

---

### `GET /health`

```json
{ "status": "ok" }
```

---

## Project Structure

```
task-manager/
├── package.json            # root scripts (install:all, dev:server, dev:client, test)
│
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── index.js        # Express app setup, middleware, error handling
│   │   ├── routes/
│   │   │   └── tasks.js    # All CRUD route handlers + input validation
│   │   └── store/
│   │       └── tasks.js    # In-memory store with pure functions (easy to swap)
│   └── __tests__/
│       └── tasks.test.js   # Integration tests via Supertest
│
└── client/
    ├── package.json
    ├── vite.config.js      # Vite + /api proxy to backend
    ├── index.html
    └── src/
        ├── main.jsx        # React entry point
        ├── App.jsx         # Root component: state, filters, layout
        ├── index.css       # Design system (CSS custom properties)
        ├── api/
        │   └── tasks.js    # Thin fetch wrapper for all API calls
        ├── hooks/
        │   └── useTasks.js # Custom hook: fetching, optimistic updates
        └── components/
            ├── TaskForm.jsx    # Shared form (new task + inline edit)
            ├── TaskCard.jsx    # Single task row with toggle/edit/delete
            └── DeleteConfirm.jsx # Confirmation modal
```

---

## What Works

- All **Must Have** requirements: create, list (newest first), toggle complete, edit, delete with confirmation, filter by All / Active / Completed
- All **Should Have** requirements: active vs completed count display, overdue highlighting (orange border + badge), empty state per filter
- Clean separation: frontend never touches the store; all logic goes through the REST API
- Loading and error states handled throughout
- Responsive on mobile

## What Doesn't Work / Known Limitations

- **No persistence** — tasks reset on server restart. The store module is intentionally isolated so it's easy to swap in a JSON-file or SQLite adapter.
- No drag-and-drop reordering (bonus item, not attempted)
- No search (bonus item, not attempted)

## Next Steps

Given more time I would:

1. **Add persistence** — swap `store/tasks.js` for a SQLite adapter using `better-sqlite3`. The interface (getAllTasks, createTask, etc.) would stay identical.
2. **Search** — a `?q=` query param on `GET /tasks` server-side, with a debounced input in the UI.
3. **Drag-and-drop reorder** — add a `position` field to tasks and use the HTML5 Drag API (or `@dnd-kit/core`) on the frontend.
4. **More test coverage** — add frontend unit tests with Vitest + React Testing Library for the TaskForm and TaskCard components.
5. **Deployment** — host the backend on Render (free tier), frontend on Vercel, and wire them together via an environment variable for the API base URL.

---

## Notes on AI Tool Usage

I used Claude to assist with this project. Every line of code has been read and understood — I am prepared to walk through any part of it in the follow-up interview. The overall architecture, component boundaries, and API design decisions are my own.
