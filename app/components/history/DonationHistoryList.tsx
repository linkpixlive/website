import type { DonationHistory } from "~/api/modules/dashboard";
import { DonationCard } from "~/components/history/DonationCard";
import { EmptyState } from "~/components/ui/EmptyState";
import { Skeleton } from "~/components/ui/Skeleton";

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
          <div key={i} className="rounded-2xl bg-wash p-3 sm:p-3.5">
            <div className="flex items-center justify-between gap-3">
              <Skeleton tone="card" className="h-4 w-40 rounded-full" />
              <Skeleton tone="card" className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton tone="card" className="mt-2 h-3 w-56 rounded-full" />
            <div className="mt-2.5 flex items-center gap-2">
              <Skeleton tone="card" className="h-12 max-w-[320px] flex-1 rounded-2xl" />
              <Skeleton tone="card" className="ml-auto h-10 w-24 shrink-0 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhuma doação recebida"
        description="Suas doações pagas aparecerão aqui ordenadas por chegada."
      />
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
