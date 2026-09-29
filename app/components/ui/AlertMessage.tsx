import { Icon } from "./Icon";
import { variantIconNames, type FeedbackVariant } from "./variant-icons";

type AlertVariant = FeedbackVariant;

interface AlertMessageProps {
  variant: AlertVariant;
  message: string;
}

const variantStyles = {
  success: "bg-success/10 border-success/20 text-success",
  error: "bg-error/10 border-error/20 text-error",
  info: "bg-info/10 border-info/20 text-info",
};

const iconNames: Record<AlertVariant, (typeof variantIconNames)[AlertVariant]> = variantIconNames;

export function AlertMessage({ variant, message }: AlertMessageProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 animate-slide-down ${variantStyles[variant]}`}
      role="alert"
    >
      <Icon name={iconNames[variant]} size={16} strokeWidth={1.9} className="shrink-0 mt-0.5" />
      <p className="text-[13px] font-medium flex-1">{message}</p>
    </div>
  );
}
