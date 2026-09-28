import { Link } from "react-router";
import type { DonationHistory } from "~/api/modules/dashboard";
import { Icon } from "~/components/ui/Icon";
import { Skeleton } from "~/components/ui/Skeleton";
import { RecentDonationRow } from "./RecentDonationRow";
import { EmptyState } from "~/components/ui/EmptyState";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";

interface RecentDonationsCardProps {
  items: DonationHistory[];
  token: string | null;
  loading?: boolean;
}

export function RecentDonationsCard({ items, token, loading = false }: RecentDonationsCardProps) {
  return (
    <section
      aria-label="Últimas doações"
      className={`h-full ${CARD_CLASS} flex flex-col`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={SECTION_HEADING_CLASS}>
          Últimas doações
        </h2>
        <Link
          to="/doacoes"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-info hover:underline outline-none"
        >
          Ver todas
          <Icon name="alt-arrow-right" size={12} strokeWidth={2} />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Nenhuma doação ainda"
          description="Compartilhe sua página para receber a primeira."
          className="flex-1 py-8"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <RecentDonationRow key={item.id} item={item} token={token} />
          ))}
        </div>
      )}
    </section>
  );
}
