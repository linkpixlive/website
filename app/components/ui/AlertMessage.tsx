import { Transition } from "@headlessui/react";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

type AlertVariant = "success" | "error" | "info";

interface AlertMessageProps {
  variant: AlertVariant;
  message: string;
}

const variantStyles = {
  success: "bg-success/10 border-success/20 text-emerald-700",
  error: "bg-error/10 border-error/20 text-error",
  info: "bg-info/10 border-info/20 text-info",
};

const iconNames: Record<AlertVariant, Extract<IconName, "check-circle" | "danger-circle" | "info-circle">> = {
  success: "check-circle",
  error: "danger-circle",
  info: "info-circle",
};

export function AlertMessage({ variant, message }: AlertMessageProps) {
  return (
    <Transition
      appear
      show={true}
      enter="transition-all duration-200 ease-out"
      enterFrom="opacity-0 -translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transition-all duration-200 ease-out"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-2"
    >
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${variantStyles[variant]}`}
        role="alert"
      >
        <Icon name={iconNames[variant]} size={16} strokeWidth={1.9} className="shrink-0 mt-0.5" />
        <p className="text-[13px] font-medium flex-1">{message}</p>
      </div>
    </Transition>
  );
}
