import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import type { OverlayDonationEntity } from "~/types/queue";

interface QueueItemCardProps {
  donation: OverlayDonationEntity;
  position?: number;
  onReplay: (id: string) => void;
  loading?: boolean;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatTimestamp(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function QueueItemCard({
  donation,
  position,
  onReplay,
  loading,
}: QueueItemCardProps) {
  const isCurrent = Boolean(donation.isCurrent);

  return (
    <li
      className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${
        isCurrent ? "-mx-3 px-3 rounded-2xl bg-[#fff7d6]/50" : ""
      }`}
    >
      <span className="w-5 text-center text-[11px] font-extrabold text-ink-label shrink-0">
        {position ?? ""}
      </span>

      <img
        src="/default-avatar.svg"
        alt={donation.name}
        className="h-9 w-9 rounded-full object-cover border border-white shadow-2xs shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-ink-heading leading-snug truncate">
            {donation.name}
          </span>
          <span className="ml-auto shrink-0 pl-2 text-sm font-extrabold text-ink-heading">
            {formatAmount(donation.amount)}
          </span>
        </div>

        {(isCurrent || donation.isTest) && (
          <div className="mt-1 flex items-center gap-1.5">
            {isCurrent && (
              <span className="inline-flex items-center rounded-full bg-[#fff7d6] text-[#b58a00] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                Exibindo agora
              </span>
            )}
            {donation.isTest && (
              <span className="inline-flex items-center rounded-full bg-[#f4f5f8] text-[#707684] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                Teste
              </span>
            )}
          </div>
        )}

        {donation.message && (
          <p className="mt-0.5 text-xs font-medium text-ink-secondary leading-snug line-clamp-2">
            {donation.message}
          </p>
        )}

        <span className="mt-0.5 block text-[11px] font-semibold text-ink-label">
          {formatTimestamp(donation.createdAt)}
        </span>
      </div>

      {!isCurrent && !donation.isTest && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onReplay(donation.id)}
          loading={loading}
          className="shrink-0"
        >
          <Icon name="repeat-one" size={16} strokeWidth={2} />
          Repetir
        </Button>
      )}
    </li>
  );
}
