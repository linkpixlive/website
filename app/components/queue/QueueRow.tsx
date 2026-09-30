import { Icon } from "~/components/ui/Icon";
import { CurrentBadge, TestBadge } from "~/components/ui/QueueBadges";
import type { OverlayDonationEntity } from "~/types/queue";
import { formatBRLReais, formatTimestamp } from "~/util/currency";

interface QueueRowProps {
  donation: OverlayDonationEntity;
  index: number;
  isConfirming: boolean;
  removing: boolean;
  onConfirmClick: (donation: OverlayDonationEntity, index: number) => void;
  onRemove: () => void;
  onCancel: () => void;
}

export function QueueRow({
  donation,
  index,
  isConfirming,
  removing,
  onConfirmClick,
  onRemove,
  onCancel,
}: QueueRowProps) {
  const isCurrent = Boolean(donation.isCurrent);

  return (
    <li
      className={`flex flex-col gap-2 py-3 first:pt-0 last:pb-0 ${isCurrent ? "-mx-2 px-2 rounded-2xl bg-yellow-wash/50 dark:bg-warning/10 border border-transparent dark:border-warning/10" : ""}`}
    >
      <div className="flex items-center gap-3">
      <span className="w-5 text-center text-[11px] font-extrabold text-ink-label shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink-heading truncate min-w-0">
            {donation.name}
          </span>
          {donation.isTest && <TestBadge className="shrink-0" />}
          <span className="ml-auto text-xs font-extrabold text-ink-heading shrink-0">
            {formatBRLReais(donation.amount)}
          </span>
        </div>
        {isCurrent && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <CurrentBadge />
          </div>
        )}
        {donation.message && (
          <p className="mt-0.5 text-xs font-medium text-ink-secondary line-clamp-1">
            {donation.message}
          </p>
        )}
        <span className="mt-0.5 block text-[11px] font-semibold text-ink-label">
          {formatTimestamp(donation.createdAt)}
        </span>
      </div>
      {!isConfirming && (
        <button
          type="button"
          onClick={() => onConfirmClick(donation, index)}
          className="w-8 h-8 rounded-full bg-wash hover:bg-danger-wash hover:text-error border border-line flex items-center justify-center text-chrome-icon transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
          title="Remover da fila"
          aria-label={`Remover ${donation.name} da fila`}
        >
          <Icon name="trash-bin-minimalistic" size={16} strokeWidth={2} />
        </button>
      )}
    </div>

    {isConfirming && (
      <div
        className="rounded-xl bg-error/5 border border-error/20 px-2.5 py-1.5 animate-fade-in"
        title="Ela continuará no histórico e poderá ser repetida depois."
      >
        <p className="truncate text-xs font-semibold text-ink-body">
          Remover{" "}
          <span className="font-bold">{donation.name}</span>?
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="shrink-0 px-2.5 py-1 rounded-full bg-error text-white text-[11px] font-bold hover:bg-error-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60 disabled:cursor-wait"
          >
            {removing ? "…" : "Sim"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={removing}
            className="shrink-0 px-2.5 py-1 rounded-full bg-wash text-[11px] font-bold text-ink-body hover:bg-wash-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60"
          >
            Não
          </button>
        </div>
      </div>
    )}
    </li>
  );
}
