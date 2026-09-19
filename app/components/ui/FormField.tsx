import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { FieldError } from "./FieldError";
import type { IconName } from "./Icon";

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string; // Ensure name is required for RHF
  label: string;
  error?: string | null;
  icon?: IconName;
  /**
   * Texto fixo à esquerda dentro do campo (ex.: base de URL). Quando
   * presente, substitui o ícone — os dois ocupam o mesmo espaço.
   */
  prefix?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, icon, prefix, className, disabled, style, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const showPrefix = !icon && prefix;
    const prefixRef = useRef<HTMLSpanElement>(null);
    const [prefixWidth, setPrefixWidth] = useState(0);

    // Mede a largura real do prefixo na fonte renderizada: `ch` superestima
    // (o glifo "0" é mais largo que as letras do domínio) e abre um vão.
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
              className="pointer-events-none absolute left-4 whitespace-nowrap text-sm font-medium text-ink-placeholder"
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
                ? { ...style, paddingLeft: 16 + prefixWidth + 6 }
                : style
            }
            className={`
              w-full bg-wash rounded-full py-2.5 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder
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
