import { forwardRef, useId } from "react";
import { Icon } from "./Icon";
import { FieldError } from "./FieldError";
import type { IconName } from "./Icon";

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string; // Ensure name is required for RHF
  label: string;
  error?: string | null;
  icon?: IconName;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, icon, className, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink-secondary">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <Icon
              name={icon}
              size={16}
              strokeWidth={1.9}
              className="absolute left-4 text-ink-secondary pointer-events-none"
            />
          )}
          <input
            ref={ref}
            {...props}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={`
              w-full bg-wash rounded-full py-2.5 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder
              border transition-colors duration-150 outline-none
              ${icon ? "pl-10 pr-4" : "px-4"}
              ${
                error
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-line focus:border-border-focus focus:ring-2 focus:ring-brand/30"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className || ""}
            `}
          />
        </div>
        <FieldError message={error} />
      </div>
    );
  }
);
FormField.displayName = "FormField";
