import React from "react";
import type { Toast } from "../contexts/ToastContext";

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  removeToast,
}) => {
  const getToastBgClass = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-success";
      case "error":
        return "bg-danger";
      case "warning":
        return "bg-warning text-dark";
      case "info":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 9999 }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast show align-items-center text-white border-0 ${getToastBgClass(
            toast.type
          )}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ minWidth: "250px" }}
        >
          <div className="d-flex">
            <div className="toast-body">
              <strong>{toast.message}</strong>
            </div>
            <button
              type="button"
              className={`btn-close ${
                toast.type === "warning" ? "" : "btn-close-white"
              } me-2 m-auto`}
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            ></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
