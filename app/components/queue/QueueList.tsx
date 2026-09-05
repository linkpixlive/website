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
      <div className="py-10 text-center">
        <h3 className="text-lg font-extrabold tracking-tight text-ink-heading">
          Nenhuma doação na fila
        </h3>
        <p className="mx-auto mt-1 max-w-xs text-sm font-medium leading-relaxed text-ink-secondary">
          As doações que entrarem aparecem aqui em tempo real.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {queue.map((donation, index) => (
        <QueueItemCard
          key={donation.id}
          donation={donation}
          position={index + 1}
          onReplay={onReplay}
          loading={replayLoading === donation.id}
        />
      ))}
    </ul>
  );
}
