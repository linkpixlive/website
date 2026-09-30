import { useState } from "react";
import { OtpInput } from "./OtpInput";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";

interface OtpFieldProps {
  name?: string;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  isOpen?: boolean;
}

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
