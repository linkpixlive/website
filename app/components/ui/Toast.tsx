import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import type { ToastItem } from "./ToastProvider";

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

const iconNames: Record<ToastItem["variant"], Extract<IconName, "check-circle" | "danger-circle" | "info-circle">> = {
  success: "check-circle",
  error: "danger-circle",
  info: "info-circle",
};

const variantStyles = {
  success: "text-success",
  error: "text-error",
  info: "text-info",
};

export function Toast({ toast, onRemove }: ToastProps) {
  return (
    <div
      role="alert"
      className="
        flex items-start gap-3 w-80 p-4 rounded-[20px] bg-card border border-gray-100/70 shadow-xl
        animate-slide-up transition-all duration-200
      "
    >
      <Icon
        name={iconNames[toast.variant]}
        size={20}
        strokeWidth={2}
        className={`shrink-0 mt-0.5 ${variantStyles[toast.variant]}`}
      />
      <div className="flex-1 text-[13px] text-ink-heading font-bold">
        {toast.message}
      </div>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="rounded-full p-1 text-ink-muted hover:text-ink-heading hover:bg-wash transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
      >
        <Icon name="close-circle" size={16} strokeWidth={1.9} />
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
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-auto max-w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
