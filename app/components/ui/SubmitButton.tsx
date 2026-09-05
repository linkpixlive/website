import { Button } from "@base-ui/react/button";
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
        w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2
        transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand/40
        ${
          isDisabled
            ? "bg-primary-disabled cursor-not-allowed text-ink-muted"
            : "bg-brand-button text-on-brand hover:bg-brand-hover active:scale-[0.98] cursor-pointer"
        }
        ${className}
      `}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-[spin_0.6s_linear_infinite]" />
      )}
      {children}
    </Button>
  );
}
