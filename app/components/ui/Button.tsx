import type { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg outline-none cursor-pointer focus:ring-1";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
  };

  const variantStyles = {
    primary: isDisabled
      ? "bg-primary-disabled text-text-muted cursor-not-allowed"
      : "bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus:ring-primary/30",
    ghost: isDisabled
      ? "border border-border text-text-muted opacity-50 cursor-not-allowed"
      : "border border-border text-text-primary hover:bg-surface-hover active:bg-secondary focus:ring-border-focus/30",
    danger: isDisabled
      ? "border border-error/10 text-error/50 bg-error/5 opacity-50 cursor-not-allowed"
      : "bg-error/10 border border-error/20 text-error hover:bg-error/20 active:bg-error/30 focus:ring-error/30",
  };

  return (
    <button
      disabled={isDisabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
