import { Button } from "@headlessui/react";
import type { ReactNode } from "react";

interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}

export function SubmitButton({
  children,
  loading,
  disabled,
  type = "submit",
  onClick,
  className = "",
}: SubmitButtonProps) {
  const isDisabled = disabled || loading;

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();

    if (!isDisabled && onClick) {
      onClick();
    }
  }

  return (
    <Button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2
        transition-all duration-150
        ${
          isDisabled
            ? "bg-primary-disabled cursor-not-allowed text-text-muted"
            : "bg-primary text-white hover:bg-primary-hover active:bg-primary-active cursor-pointer"
        }
        ${className}
      `}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-[spin_0.6s_linear_infinite]" />
      )}
      {children}
    </Button>
  );
}
