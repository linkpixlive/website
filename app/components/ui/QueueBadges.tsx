import { cn } from "~/util/cn";

const CURRENT_BASE =
  "inline-flex items-center rounded-full bg-yellow-wash text-yellow-ink border border-yellow-wash dark:bg-warning/15 dark:text-warning dark:border-warning/20 font-extrabold uppercase tracking-wider";

const TEST_BASE =
  "inline-flex items-center rounded-full bg-wash text-ink-secondary border border-line font-extrabold uppercase tracking-wider";

const SIZES = {
  xs: "text-[10px] px-2 py-0.5",
  sm: "text-xs px-2.5 py-1",
} as const;

interface BadgeProps {
  size?: keyof typeof SIZES;
  className?: string;
  title?: string;
}

export function CurrentBadge({ size = "xs", className, title }: BadgeProps) {
  return (
    <span
      className={cn(CURRENT_BASE, SIZES[size], "whitespace-nowrap", className)}
      title={title}
    >
      Exibindo agora
    </span>
  );
}

export function TestBadge({ size = "xs", className }: BadgeProps) {
  return (
    <span className={cn(TEST_BASE, SIZES[size], className)}>Teste</span>
  );
}
