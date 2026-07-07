import { Transition } from "@headlessui/react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type AlertVariant = "success" | "error" | "info";

interface AlertMessageProps {
  variant: AlertVariant;
  message: string;
}

const variantStyles = {
  success: "bg-success/10 border-success/20 text-success",
  error: "bg-error/10 border-error/20 text-error",
  info: "bg-info/10 border-info/20 text-info",
};

const IconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function AlertMessage({ variant, message }: AlertMessageProps) {
  const Icon = IconMap[variant];

  return (
    <Transition
      appear
      show={true}
      enter="transition-all duration-300 ease-out"
      enterFrom="opacity-0 -translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transition-all duration-200 ease-in"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-2"
    >
      <div
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${variantStyles[variant]}`}
        role="alert"
      >
        <Icon className="h-4 w-4 shrink-0 mt-0.5" />
        <p className="text-sm flex-1">{message}</p>
      </div>
    </Transition>
  );
}
