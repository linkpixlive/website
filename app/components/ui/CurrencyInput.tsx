import { forwardRef, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { maskCurrencyInput, parseCurrencyToCents } from "~/util/currency";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  name: string;
  value?: string;
  onChange?: (value: string, cents: number) => void;
  minCents?: number;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const PREFIX = "R$ ";

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ name, value, onChange, minCents, placeholder = "0,00", error, disabled, className, ...props }, ref) => {
    const { control, formState: { errors }, setValue, watch } = useFormContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const isControlled = value !== undefined;

    const currentValue = isControlled ? value : watch(name) ?? "";
    const currentError = error ?? errors[name]?.message;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const masked = maskCurrencyInput(raw);
      const cents = parseCurrencyToCents(masked);

      const finalValue = masked || "";

      if (!isControlled) {
        setValue(name, finalValue, { shouldValidate: true, shouldDirty: true });
      }
      onChange?.(finalValue, cents);
    };

    const handleBlur = () => {
      const current = inputRef.current?.value ?? "";
      const cents = parseCurrencyToCents(current);
      if (minCents && cents > 0 && cents < minCents) {
        const minFormatted = maskCurrencyInput(String(minCents));
        if (!isControlled) {
          setValue(name, minFormatted, { shouldValidate: true, shouldDirty: true });
        }
        onChange?.(minFormatted, minCents);
      }
    };

    const combinedRef = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const displayValue = currentValue || "";

    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const { ref: _fieldRef, ...fieldProps } = field;
          return (
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-medium text-ink-secondary pointer-events-none">
                {PREFIX}
              </span>
              <input
                ref={combinedRef}
                {...fieldProps}
                {...props}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                aria-invalid={currentError ? true : undefined}
                aria-describedby={currentError ? `${name}-error` : undefined}
                className={cn(
                  "w-full bg-wash rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder border transition-colors duration-150 outline-none",
                  currentError
                    ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                    : "border-line focus:border-border-focus focus:ring-2 focus:ring-brand/30",
                  disabled && "opacity-50 cursor-not-allowed",
                  className,
                )}
              />
            </div>
          );
        }}
      />
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";