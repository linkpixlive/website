import { Toast } from "@base-ui/react/toast";
import { Icon } from "./Icon";
import { variantIconNames, type FeedbackVariant } from "./variant-icons";

const iconNames: Record<string, (typeof variantIconNames)[FeedbackVariant]> = {
  success: variantIconNames.success,
  error: variantIconNames.error,
  info: variantIconNames.info,
};

const variantStyles: Record<string, string> = {
  success: "text-success",
  error: "text-error",
  info: "text-info",
};

export function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => {
    const variant = toast.type && iconNames[toast.type] ? toast.type : "info";
    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        swipeDirection={["down", "right"]}
        className="
          w-80 max-w-full rounded-[20px] bg-card border border-line shadow-xl
          transition-[opacity,translate] duration-200 ease-out
          data-starting-style:opacity-0 data-starting-style:translate-y-4
          data-ending-style:opacity-0
        "
      >
        <Toast.Content className="flex items-start gap-3 p-4">
          <Icon
            name={iconNames[variant]}
            size={20}
            strokeWidth={2}
            className={`shrink-0 mt-0.5 ${variantStyles[variant]}`}
          />
          <Toast.Title className="flex-1 text-[13px] text-ink-heading font-bold" />
          <Toast.Close className="rounded-full p-1 text-ink-muted hover:text-ink-heading hover:bg-wash transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95">
            <Icon name="close-circle" size={16} strokeWidth={1.9} />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    );
  });
}
