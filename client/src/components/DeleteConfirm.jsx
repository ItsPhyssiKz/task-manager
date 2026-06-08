import { useEffect, useRef } from "react";

export default function DeleteConfirm({ taskTitle, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  // Auto-focus cancel button and handle Escape key (#10)
  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="modal-backdrop"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 id="delete-confirm-title">Delete task?</h3>
        <p>
          "<strong>{taskTitle}</strong>" will be permanently removed. This
          cannot be undone.
        </p>
        <div className="modal-actions">
          <button
            ref={cancelRef}
            className="btn btn-ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
