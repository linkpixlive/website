import { useEffect, useRef } from "react";
import { OTPField } from "@base-ui/react/otp-field";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({ length = 6, onComplete, onChange, disabled, error }: OtpInputProps) {
  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!disabled) {
      firstRef.current?.focus();
    }
  }, [disabled]);

  return (
    <OTPField.Root
      length={length}
      disabled={disabled}
      onValueChange={onChange}
      onValueComplete={onComplete}
      className={`flex justify-center gap-2 ${error ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
    >
      {Array.from({ length }, (_, index) => (
        <OTPField.Input
          key={index}
          ref={index === 0 ? firstRef : undefined}
          inputMode="numeric"
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
    </OTPField.Root>
  );
}
