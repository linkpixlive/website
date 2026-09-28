import { useState } from "react";
import { OtpInput } from "./OtpInput";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";

interface OtpFieldProps {
  /** Quando informado, emite um input hidden para o FormData do `<Form>`. */
  name?: string;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  /** Chamado com o código completo assim que os 6 dígitos fecharem. */
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  /** Zera o campo quando o modal reabre. */
  isOpen?: boolean;
}

/** Os 6 dígitos do TOTP, com estado próprio: usado por toda ação que exige
 *  step-up quando o 2FA está ativo. Serve tanto para `<Form>` (via `name`) quanto
 *  para react-hook-form (via `onChange`). */
export function OtpField({
  name,
  label,
  disabled,
  error,
  onComplete,
  onChange,
  isOpen = true,
}: OtpFieldProps) {
  const [code, setCode] = useState("");

  useResetOnOpen(isOpen, () => {
    setCode("");
    onChange?.("");
  });

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      )}

      <OtpInput
        onComplete={(full) => {
          setCode(full);
          onChange?.(full);
          onComplete?.(full);
        }}
        onChange={setCode}
        disabled={disabled}
        error={error}
      />

      {name && <input type="hidden" name={name} value={code} />}
    </div>
  );
}
