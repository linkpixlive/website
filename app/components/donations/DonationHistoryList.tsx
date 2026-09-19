import type { DonationHistory } from "~/api/modules/dashboard";
import { DonationCard } from "~/components/donations/DonationCard";

interface DonationHistoryListProps {
  items: DonationHistory[];
  loading?: boolean;
  onReplay?: (id: string) => void;
  replayLoading?: string | null;
  currentId?: string | null;
  token?: string | null;
}

export function DonationHistoryList({
  items,
  loading = false,
  onReplay,
  replayLoading,
  currentId,
  token = null,
}: DonationHistoryListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-wash p-3 sm:p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="h-4 w-40 rounded-md bg-card" />
              <div className="h-4 w-16 rounded-md bg-card" />
            </div>
            <div className="mt-2 h-3 w-56 rounded-md bg-card" />
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-12 max-w-[320px] flex-1 rounded-2xl bg-card" />
              <div className="ml-auto h-10 w-24 shrink-0 rounded-full bg-card" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <h3 className="text-lg font-extrabold tracking-tight text-ink-heading">
          Nenhuma doação recebida
        </h3>
        <p className="text-sm text-ink-secondary mt-1">
          Suas doações pagas aparecerão aqui ordenadas por chegada.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <DonationCard
          key={item.id}
          item={item}
          isCurrent={currentId === item.id}
          onReplay={onReplay}
          replayLoading={replayLoading === item.id}
          token={token}
        />
      ))}
    </div>
  );
}
