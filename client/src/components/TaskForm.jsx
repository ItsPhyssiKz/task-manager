import { useState } from "react";

const EMPTY = { title: "", description: "", dueDate: "" };

export default function TaskForm({ onAdd, editData, onSave, onCancel, isEdit }) {
  const initial = editData
    ? {
        title: editData.title,
        description: editData.description || "",
        dueDate: editData.dueDate ? editData.dueDate.slice(0, 10) : "",
      }
    : EMPTY;

  const [form, setForm] = useState(initial);
  const [titleError, setTitleError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (field === "title") setTitleError("");
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate || null,
      };
      if (isEdit) {
        await onSave(payload);
      } else {
        await onAdd(payload);
        setForm(EMPTY);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={isEdit ? "task-edit-form" : "task-form-card"}>
      {!isEdit && <h2>New Task</h2>}
      <div className="form-row">
        <div className="form-group full">
          <label htmlFor={isEdit ? "edit-title" : "new-title"}>Title *</label>
          <input
            id={isEdit ? "edit-title" : "new-title"}
            className={`form-input${titleError ? " error" : ""}`}
            placeholder="What needs to be done?"
            value={form.title}
            onChange={set("title")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {titleError && <span className="form-error">{titleError}</span>}
        </div>
        <div className="form-group full">
          <label htmlFor={isEdit ? "edit-desc" : "new-desc"}>Description</label>
          <textarea
            id={isEdit ? "edit-desc" : "new-desc"}
            className="form-textarea"
            placeholder="Optional details…"
            value={form.description}
            onChange={set("description")}
            rows={2}
          />
        </div>
        <div className="form-group">
          <label htmlFor={isEdit ? "edit-due" : "new-due"}>Due date</label>
          <input
            id={isEdit ? "edit-due" : "new-due"}
            type="date"
            className="form-input"
            value={form.dueDate}
            onChange={set("dueDate")}
          />
        </div>
      </div>
      <div className="form-actions">
        {(isEdit || onCancel) && (
          <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add task"}
        </button>
      </div>
    </div>
  );
}
