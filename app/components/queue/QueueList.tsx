import { ListOrdered } from "lucide-react";
import { QueueItemCard } from "./QueueItemCard";
import type { OverlayDonationEntity } from "~/types/queue";

interface QueueListProps {
  queue: OverlayDonationEntity[];
  onReplay: (id: string) => void;
  replayLoading?: string | null;
}

export function QueueList({ queue, onReplay, replayLoading }: QueueListProps) {
  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-hover mb-4">
          <ListOrdered className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-base font-semibold text-text-heading mb-1">
          Nenhuma doação na fila
        </h3>
        <p className="text-sm text-text-secondary max-w-xs">
          As doações que entrarem aparecerão aqui em tempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((donation) => (
        <QueueItemCard
          key={donation.id}
          donation={donation}
          onReplay={onReplay}
          loading={replayLoading === donation.id}
        />
      ))}
    </div>
  );
}
