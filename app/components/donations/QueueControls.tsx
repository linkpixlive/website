import type { OverlayDonationEntity } from "~/types/queue";
import { DonationQueuePopover } from "~/components/queue/DonationQueuePopover";
import { Icon } from "~/components/ui/Icon";

interface QueueControlsProps {
  queue: OverlayDonationEntity[];
  token: string | null;
  skipLoading?: boolean;
  clearLoading?: boolean;
  onSkip: () => void;
  onClear: () => void;
}

export function QueueControls({
  queue,
  token,
  skipLoading = false,
  clearLoading = false,
  onSkip,
  onClear,
}: QueueControlsProps) {
  return (
    <div className="flex min-h-[36px] items-center gap-2">
      {queue.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <DonationQueuePopover queue={queue} token={token} quiet />

          <button
            type="button"
            onClick={onSkip}
            disabled={skipLoading}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-card px-3 text-xs font-bold text-ink-secondary transition-colors outline-none hover:bg-tile hover:text-ink-heading focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-wait disabled:opacity-60"
          >
            <Icon name="skip-next" size={16} strokeWidth={2} />
            {skipLoading ? "Pulando…" : "Pular"}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={clearLoading}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-card px-3 text-xs font-bold text-error/80 transition-colors outline-none hover:bg-danger-wash/40 hover:text-error focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-wait disabled:opacity-60"
          >
            <Icon name="trash-bin-minimalistic" size={16} strokeWidth={2} />
            {clearLoading ? "Limpando…" : "Limpar"}
          </button>
        </div>
      )}
    </div>
  );
}
