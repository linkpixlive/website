import { forwardRef, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { maskCurrencyInput, parseCurrencyToCents } from "~/util/currency";
import { mergeRefs } from "~/util/merge-refs";
import { MoneyInputBase } from "./MoneyInputBase";

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

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ name, value, onChange, minCents, placeholder = "0,00", error, disabled, ...props }, ref) => {
    const { control, formState: { errors }, setValue, watch } = useFormContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const isControlled = value !== undefined;

    const currentValue = isControlled ? value : watch(name) ?? "";
    const rhfError = errors[name]?.message;
    const currentError = error ?? (typeof rhfError === "string" ? rhfError : undefined);

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

    const combinedRef = mergeRefs(inputRef, ref);

    const displayValue = currentValue || "";

    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const { ref: _fieldRef, ...fieldProps } = field;
          return (
            <MoneyInputBase
              id={name}
              error={currentError}
              disabled={disabled}
            >
              {(inputClassName) => (
                <input
                  ref={combinedRef}
                  {...fieldProps}
                  {...props}
                  id={name}
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
                  className={inputClassName}
                />
              )}
            </MoneyInputBase>
          );
        }}
      />
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";