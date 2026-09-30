import type { ReactNode } from "react";
import { DonationQueuePopover } from "./DonationQueuePopover";
import { QueueToolbar } from "./QueueToolbar";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { cn } from "~/util/cn";
import type { OverlayDonationEntity } from "~/types/queue";

interface QueueControlsSectionProps {
  queue: OverlayDonationEntity[];
  token: string | null;
  isPaused: boolean;
  actionLoading: Record<string, boolean>;
  onTogglePause: () => void;
  onSkip: () => void;
  onClear: () => void;
  onTest: () => void;
  onOpenPopup?: () => void;
  className?: string;
  toolbarExtra?: ReactNode;
}

export function QueueControlsSection({
  queue,
  token,
  isPaused,
  actionLoading,
  onTogglePause,
  onSkip,
  onClear,
  onTest,
  onOpenPopup,
  className,
  toolbarExtra,
}: QueueControlsSectionProps) {
  return (
    <section aria-label="Controles da fila" className={cn(CARD_CLASS, className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className={cn(SECTION_HEADING_CLASS, "shrink-0")}>Controles</h2>
        <div className="flex flex-wrap items-center gap-2">
          <DonationQueuePopover queue={queue} token={token} />
          <QueueToolbar
            isPaused={isPaused}
            onTogglePause={onTogglePause}
            onSkip={onSkip}
            onClear={onClear}
            onTest={onTest}
            onOpenPopup={onOpenPopup}
            loading={actionLoading}
          />
          {toolbarExtra}
        </div>
      </div>
    </section>
  );
}
