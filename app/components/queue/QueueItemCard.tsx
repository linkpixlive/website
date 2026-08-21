import { Repeat } from "lucide-react";
import { Button } from "~/components/ui/Button";
import type { OverlayDonationEntity } from "~/types/queue";

interface QueueItemCardProps {
  donation: OverlayDonationEntity;
  onReplay: (id: string) => void;
  loading?: boolean;
}

function formatTimestamp(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function QueueItemCard({ donation, onReplay, loading }: QueueItemCardProps) {
  return (
    <div className="flex items-start gap-4 bg-surface border border-border rounded-2xl p-4 transition-all duration-150 hover:border-border-focus/30">
      <img
        src={donation.donorAvatarUrl || "/default-avatar.svg"}
        alt={donation.donorName}
        className="h-10 w-10 rounded-full object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-text-heading truncate">
            {donation.donorName}
          </span>
          <span className="text-sm font-bold text-primary shrink-0">
            {donation.amountFormatted}
          </span>
        </div>

        {donation.message && (
          <p className="text-sm text-text-primary line-clamp-2 mb-1">
            {donation.message}
          </p>
        )}

        <span className="text-xs text-text-muted">
          {formatTimestamp(donation.createdAt)}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReplay(donation.id)}
        loading={loading}
      >
        <Repeat className="h-4 w-4" />
        Repetir
      </Button>
    </div>
  );
}
