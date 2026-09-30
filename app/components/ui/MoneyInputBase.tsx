import type { ReactNode } from "react";
import { FieldError } from "./FieldError";
import { cn } from "~/util/cn";

interface MoneyInputBaseProps {
  id: string;
  label?: ReactNode;
  hint?: string;
  error?: string | null;
  disabled?: boolean;
  children: (inputClassName: string) => ReactNode;
}

export function MoneyInputBase({
  id,
  label,
  hint,
  error,
  disabled,
  children,
}: MoneyInputBaseProps) {
  const inputClassName = cn(
    "w-full bg-wash rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder border transition-colors duration-150 outline-none",
    error
      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
      : "border-line-input focus:border-border-focus focus:ring-2 focus:ring-brand/30",
    disabled && "opacity-50 cursor-not-allowed",
  );

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-ink-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 text-sm font-medium text-ink-secondary"
        >
          R$
        </span>
        {children(inputClassName)}
      </div>
      {hint && (
        <p className="text-xs font-medium text-ink-muted leading-snug">
          {hint}
        </p>
      )}
      <FieldError message={error} />
    </div>
  );
}
