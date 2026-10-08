import type { DonationHistory } from "~/api/modules/dashboard";
import { Skeleton } from "~/components/ui/Skeleton";
import { RecentDonationRow } from "./RecentDonationRow";
import { EmptyState } from "~/components/ui/EmptyState";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";

interface RecentDonationsCardProps {
  items: DonationHistory[];
  token: string | null;
  loading?: boolean;
}

export function RecentDonationsCard({ items, token, loading = false }: RecentDonationsCardProps) {
  return (
    <section aria-label="Últimas doações">
      <div className="flex items-center justify-between gap-3">
        <h2 className={SECTION_HEADING_CLASS}>
          Últimas doações
        </h2>
      </div>

      {loading ? (
        <div className="mt-3 flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Nenhuma doação ainda"
          description="Compartilhe sua página para receber a primeira."
          className="py-8"
        />
      ) : (
        <ul className="mt-1 divide-y divide-line/60">
          {items.map((item) => (
            <RecentDonationRow key={item.id} item={item} token={token} />
          ))}
        </ul>
      )}
    </section>
  );
}
