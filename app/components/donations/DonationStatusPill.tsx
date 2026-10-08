import { cn } from "~/util/cn";

export type DonationStatusTone = "current" | "displayed" | "queued" | "test";

const TONES: Record<
  DonationStatusTone,
  { pill: string; dot?: string; label: string; pulse?: boolean }
> = {
  current: {
    pill: "bg-info/10 text-info",
    dot: "bg-info",
    label: "Em exibição",
    pulse: true,
  },
  displayed: {
    pill: "bg-success/10 text-success",
    dot: "bg-success",
    label: "Exibido",
  },
  queued: {
    pill: "bg-warning/15 text-yellow-ink",
    dot: "bg-warning",
    label: "Na fila",
  },
  test: { pill: "bg-wash text-ink-secondary", label: "Teste" },
};

interface DonationStatusPillProps {
  tone: DonationStatusTone;
  className?: string;
}

export function DonationStatusPill({
  tone,
  className,
}: DonationStatusPillProps) {
  const status = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
        status.pill,
        className,
      )}
    >
      {status.dot && (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status.dot,
            status.pulse && "animate-pulse",
          )}
        />
      )}
      {status.label}
    </span>
  );
}
