import type { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "inverse" | "danger" | "success";
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

  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all duration-150 rounded-full outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/40";

  const sizeStyles = {
    sm: "px-4 h-10 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
  };

  const variantStyles = {
    primary: isDisabled
      ? "bg-primary-disabled text-ink-muted cursor-not-allowed"
      : "bg-brand-button text-ink-heading hover:bg-brand-hover active:scale-[0.98]",
    secondary: isDisabled
      ? "bg-wash text-ink-label cursor-not-allowed"
      : "bg-wash text-ink-body hover:bg-gray-100 active:scale-[0.98]",
    ghost: isDisabled
      ? "bg-wash text-ink-label cursor-not-allowed"
      : "bg-wash text-ink-body hover:bg-gray-100 active:scale-[0.98]",
    inverse: isDisabled
      ? "bg-inverse/50 text-white/60 cursor-not-allowed"
      : "bg-inverse text-white hover:bg-black active:scale-[0.98]",
    danger: isDisabled
      ? "bg-error/40 text-white cursor-not-allowed"
      : "bg-error text-white hover:bg-error-hover shadow-md shadow-error/30 active:scale-[0.98]",
    success: isDisabled
      ? "bg-success/40 text-white cursor-not-allowed"
      : "bg-success text-white hover:bg-emerald-600 active:scale-[0.98]",
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
