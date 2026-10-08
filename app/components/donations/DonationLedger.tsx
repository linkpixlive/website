import type { DonationHistory } from "~/api/modules/dashboard";
import { EmptyState } from "~/components/ui/EmptyState";
import { Skeleton } from "~/components/ui/Skeleton";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { useNow } from "~/hooks/useNow";
import { groupHistoryByDate } from "~/util/history-groups";
import { DonationLedgerRow } from "./DonationLedgerRow";

interface DonationLedgerProps {
  items: DonationHistory[];
  loading?: boolean;
  onReplay?: (id: string) => void;
  replayLoading?: string | null;
  currentId?: string | null;
  token?: string | null;
}

export function DonationLedger({
  items,
  loading = false,
  onReplay,
  replayLoading,
  currentId,
  token = null,
}: DonationLedgerProps) {
  const now = useNow();
  if (loading) {
    return (
      <div className="flex flex-col divide-y divide-line" aria-label="Carregando doações">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-4">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-3 w-24 rounded-full" />
            <Skeleton className="mt-2 h-4 w-3/4 rounded-full" />
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
    <div className="flex flex-col gap-10">
      {groupHistoryByDate(items).map((group) => (
        <section key={group.key} aria-label={group.label}>
          <h3 className={SECTION_HEADING_CLASS}>{group.label}</h3>
          <ul className="mt-1 divide-y divide-line">
            {group.items.map((item) => (
              <DonationLedgerRow
                key={item.id}
                item={item}
                isCurrent={currentId === item.id}
                onReplay={onReplay}
                replayLoading={replayLoading === item.id}
                token={token}
                now={now}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
