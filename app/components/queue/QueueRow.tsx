import { DonationStatusPill } from "~/components/donations/DonationStatusPill";
import { Icon } from "~/components/ui/Icon";
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
  now?: number | null;
}

export function QueueRow({
  donation,
  index,
  isConfirming,
  removing,
  onConfirmClick,
  onRemove,
  onCancel,
  now = null,
}: QueueRowProps) {
  const isCurrent = Boolean(donation.isCurrent);

  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-2">
        <span className="w-5 shrink-0 pt-0.5 text-center text-[11px] font-extrabold text-ink-muted">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-heading">
              {donation.name}
            </span>
            <span className="shrink-0 text-sm font-extrabold whitespace-nowrap tabular-nums text-ink-heading">
              {formatBRLReais(donation.amount)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="shrink-0 text-[11px] font-semibold whitespace-nowrap text-ink-muted">
              {formatTimestamp(donation.createdAt, now)}
            </span>
            {isCurrent && <DonationStatusPill tone="current" />}
            {donation.isTest && <DonationStatusPill tone="test" />}
          </div>
          {donation.message && (
            <p className="mt-0.5 line-clamp-1 text-xs font-medium text-ink-secondary">
              {donation.message}
            </p>
          )}
        </div>
        {!isConfirming && (
          <button
            type="button"
            onClick={() => onConfirmClick(donation, index)}
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted transition-colors duration-150 outline-none hover:bg-danger-wash/40 hover:text-error focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-95"
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
            className="shrink-0 px-2.5 py-1 rounded-full bg-error-solid text-white text-[11px] font-bold hover:bg-error-solid-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60 disabled:cursor-wait"
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
