import { useState, useCallback, useEffect } from "react";

let toastId = 0;

/**
 * Hook that manages a stack of toast notifications with auto-dismiss.
 */
export function useToast(durationMs = 3000) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);

    return id;
  }, [durationMs]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

/**
 * Renders a stack of toast notifications.
 */
export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 180);
  };

  return (
    <div className={`toast toast-${toast.type}${exiting ? " toast-exit" : ""}`}>
      <span className="toast-icon">
        {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
      </span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={handleDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
