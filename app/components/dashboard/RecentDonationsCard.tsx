import { Link } from "react-router";
import type { DonationHistory } from "~/api/modules/dashboard";
import { Icon } from "~/components/ui/Icon";
import { Skeleton } from "~/components/ui/Skeleton";
import { RecentDonationRow } from "./RecentDonationRow";

interface RecentDonationsCardProps {
  items: DonationHistory[];
  token: string | null;
  loading?: boolean;
}

export function RecentDonationsCard({ items, token, loading = false }: RecentDonationsCardProps) {
  return (
    <section
      aria-label="Últimas doações"
      className="h-full rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
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
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <p className="text-base font-extrabold tracking-tight text-ink-heading">
            Nenhuma doação ainda
          </p>
          <p className="text-sm text-ink-secondary mt-1 max-w-xs">
            Compartilhe sua página para receber a primeira.
          </p>
        </div>
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
