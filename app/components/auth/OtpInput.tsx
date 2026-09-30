import { useEffect, useRef, useState } from "react";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

/** Primitivo interno das 6 caixas. Uso externo: importe `OtpField`
 *  (única API pública — trata `name/hidden`, `onChange` RHF e reset). */
export function OtpInput({ length = 6, onComplete, onChange, disabled, error }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    
    // Only allow numbers
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue && value !== "") return;

    const newDigits = [...digits];
    newDigits[index] = cleanValue.slice(-1); // Take last char if multiple
    setDigits(newDigits);
    onChange?.(newDigits.join(""));

    // Auto-advance
    if (cleanValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const fullCode = newDigits.join("");
    if (fullCode.length === length && !newDigits.includes("")) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Move focus back on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      onChange?.(newDigits.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    onChange?.(newDigits.join(""));

    // Focus last filled or next empty
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <div 
      className={`flex justify-center gap-2 ${error ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className={`
            w-11 h-12 text-center text-lg font-mono font-semibold bg-wash rounded-full text-ink-heading
            border transition-colors duration-150 outline-none
            ${
              error
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                : "border-line-input focus:border-border-focus focus:ring-2 focus:ring-brand/30"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />
      ))}
    </div>
  );
}
