import { useId, useState } from "react";
import { FieldError } from "./FieldError";
import {
  formatCentsToInput,
  maskCurrencyInput,
  parseCurrencyToCents,
} from "~/util/currency";

/**
 * Campo monetário BRL não-controlado para `fetcher.Form` (sem RHF).
 *
 * Exibe a máscara pt-BR (`1.000,00` com prefixo `R$`) enquanto o
 * `<input type="hidden">` carrega o valor normalizado ponto-decimal
 * (`1000.00`), formato que o `parseAmount` do server já entende.
 */
export interface MoneyFieldProps {
  name: string;
  label: string;
  /** Valor inicial em reais (ex.: `String(settings.minTextAmount)`). */
  defaultValue?: string | number;
  hint?: string;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
  /** Chamado a cada tecla com `(mascarado, centavos)` — para autosave. */
  onChange?: (value: string, cents: number) => void;
  /** Chamado no blur — ponto de salvamento explícito no autosave. */
  onBlur?: () => void;
}

function toMaskedInitial(raw: string | number | undefined): string {
  if (raw === undefined) return "";
  // `defaultValue` vem em reais (ex.: "10" ou "10.5") → centavos → máscara.
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
  // Normalizado ponto-decimal para o FormData (ex.: "1000.00").
  const normalized = cents ? (cents / 100).toFixed(2) : "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={generatedId}
        className="text-[13px] font-medium text-ink-secondary"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 text-sm font-medium text-ink-secondary"
        >
          R$
        </span>
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
          className={`
            w-full bg-wash rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder
            border transition-colors duration-150 outline-none
            ${
              error
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                : "border-line-input focus:border-border-focus focus:ring-2 focus:ring-brand/30"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />
      </div>
      <input type="hidden" name={name} value={normalized} />
      {hint && (
        <p className="text-xs font-medium text-ink-muted leading-snug">
          {hint}
        </p>
      )}
      <FieldError message={error} />
    </div>
  );
}
