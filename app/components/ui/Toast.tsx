import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ToastItem } from "./ToastProvider";

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const variantStyles = {
  success: "border-success/30 bg-surface/90 text-success shadow-success/5",
  error: "border-error/30 bg-surface/90 text-error shadow-error/5",
  info: "border-info/30 bg-surface/90 text-info shadow-info/5",
};

export function Toast({ toast, onRemove }: ToastProps) {
  const Icon = iconMap[toast.variant];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 w-80 p-4 rounded-xl border shadow-lg backdrop-blur-md
        animate-[fadeInUp_0.3s_ease-out] transition-all duration-300
        ${variantStyles[toast.variant]}
      `}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-text-heading font-medium">
        {toast.message}
      </div>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors duration-150 cursor-pointer outline-none shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2 pointer-events-auto max-w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
