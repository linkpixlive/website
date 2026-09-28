import { cn } from "~/util/cn";

const SIZES = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
} as const;

const TONES = {
  current: "border-current/30 border-t-current",
  brand: "border-brand-button/30 border-t-brand-button",
} as const;

export function Spinner({
  size = "sm",
  tone = "current",
  className,
}: {
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "rounded-full border-2 animate-spin shrink-0",
        SIZES[size],
        TONES[tone],
        className,
      )}
    />
  );
}
