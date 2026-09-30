import { Icon } from "./Icon";
import { cn } from "~/util/cn";

const SIZES = {
  sm: "p-1 rounded-full text-chrome-icon hover:bg-wash transition-colors duration-150 cursor-pointer outline-none active:scale-95 shrink-0",
  lg: "w-11 h-11 rounded-full bg-card hover:bg-tile border border-line shadow-xs text-chrome-icon transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95",
} as const;

interface EyeToggleButtonProps {
  visible: boolean;
  onToggle: () => void;
  size?: keyof typeof SIZES;
  iconSize?: number;
  showLabel?: string;
  hideLabel?: string;
  className?: string;
}

export function EyeToggleButton({
  visible,
  onToggle,
  size = "sm",
  iconSize,
  showLabel = "Mostrar",
  hideLabel = "Ocultar",
  className,
}: EyeToggleButtonProps) {
  const label = visible ? hideLabel : showLabel;
  return (
    <button
      type="button"
      onClick={onToggle}
      title={label}
      aria-label={label}
      className={cn(SIZES[size], className)}
    >
      <Icon
        name={visible ? "eye-closed" : "eye"}
        size={iconSize ?? (size === "lg" ? 18 : 16)}
        strokeWidth={size === "lg" ? 2 : 1.9}
        className={size === "lg" ? "mx-auto" : undefined}
      />
    </button>
  );
}
