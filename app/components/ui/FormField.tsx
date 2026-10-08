import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { FieldError } from "./FieldError";
import type { IconName } from "./Icon";

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label: string;
  error?: string | null;
  icon?: IconName;
  prefix?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, icon, prefix, className, disabled, style, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const showPrefix = !icon && prefix;
    const prefixRef = useRef<HTMLSpanElement>(null);
    const [prefixWidth, setPrefixWidth] = useState(0);

    useEffect(() => {
      if (showPrefix && prefixRef.current) {
        setPrefixWidth(prefixRef.current.offsetWidth);
      }
    }, [showPrefix, prefix]);

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
          {showPrefix && (
            <span
              ref={prefixRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 whitespace-nowrap text-sm font-medium text-ink-placeholder/60"
            >
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            {...props}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            style={
              showPrefix
                ? { ...style, paddingLeft: 16 + prefixWidth + 2 }
                : style
            }
            className={`
              w-full bg-card rounded-full py-2.5 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder
              border transition-colors duration-150 outline-none
              ${icon ? "pl-10 pr-4" : ""}
              ${showPrefix ? "pr-4" : ""}
              ${!icon && !showPrefix ? "px-4" : ""}
              ${
                error
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-line-input focus:border-border-focus focus:ring-2 focus:ring-brand/30"
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
