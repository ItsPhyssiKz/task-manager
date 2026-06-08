const API_URL = import.meta.env.VITE_API_URL || "";
const BASE = `${API_URL}/api/tasks`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null; // no body on delete

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const tasksApi = {
  getAll: (status = "all") =>
    request(`${BASE}?status=${status}`),

  create: (task) =>
    request(BASE, { method: "POST", body: JSON.stringify(task) }),

  update: (id, updates) =>
    request(`${BASE}/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),

  remove: (id) =>
    request(`${BASE}/${id}`, { method: "DELETE" }),
};
