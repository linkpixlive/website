import { useId, useState } from "react";
import { MoneyInputBase } from "./MoneyInputBase";
import {
  formatCentsToInput,
  maskCurrencyInput,
  parseCurrencyToCents,
} from "~/util/currency";

export interface MoneyFieldProps {
  name: string;
  label: string;
  defaultValue?: string | number;
  hint?: string;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string, cents: number) => void;
  onBlur?: () => void;
}

function toMaskedInitial(raw: string | number | undefined): string {
  if (raw === undefined) return "";
  const num = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(num) || num <= 0) return "";
  return formatCentsToInput(Math.round(num * 100));
}

export function MoneyField({
  name,
  label,
  defaultValue,
  hint,
  error,
  disabled,
  placeholder = "0,00",
  onChange,
  onBlur,
}: MoneyFieldProps) {
  const generatedId = useId();
  const [masked, setMasked] = useState(() => toMaskedInitial(defaultValue));

  const cents = parseCurrencyToCents(masked);
  const normalized = cents ? (cents / 100).toFixed(2) : "";

  return (
    <MoneyInputBase
      id={generatedId}
      label={label}
      hint={hint}
      error={error}
      disabled={disabled}
    >
      {(inputClassName) => (
        <>
          <input
            id={generatedId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={placeholder}
            value={masked}
            onChange={(event) => {
              const next = maskCurrencyInput(event.target.value);
              setMasked(next);
              onChange?.(next, parseCurrencyToCents(next));
            }}
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={inputClassName}
          />
          <input type="hidden" name={name} value={normalized} />
        </>
      )}
    </MoneyInputBase>
  );
}
