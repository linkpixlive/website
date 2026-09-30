import { Button } from "@base-ui/react/button";
import type { ReactNode } from "react";
import { Spinner } from "./Spinner";

interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}

export function SubmitButton({
  children,
  loading,
  isLoading,
  disabled,
  type = "submit",
  onClick,
  className = "",
}: SubmitButtonProps) {
  const busy = loading ?? isLoading ?? false;
  const isDisabled = disabled || busy;

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
        w-full px-8 py-3 rounded-full text-sm font-bold whitespace-nowrap flex items-center justify-center gap-2
        transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand/40
        ${
          isDisabled
            ? "bg-primary-disabled cursor-not-allowed text-ink-muted"
            : "bg-brand-button text-on-brand hover:bg-brand-hover active:scale-[0.98] cursor-pointer"
        }
        ${className}
      `}
    >
      {busy && <Spinner />}
      {children}
    </Button>
  );
}
