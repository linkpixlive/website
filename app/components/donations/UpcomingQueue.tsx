import { useState } from "react";
import type { OverlayDonationEntity } from "~/types/queue";
import { Icon } from "~/components/ui/Icon";

interface UpcomingQueueProps {
  queue: OverlayDonationEntity[];
  isPaused: boolean;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function UpcomingQueue({ queue, isPaused }: UpcomingQueueProps) {
  const [expanded, setExpanded] = useState(isPaused);
  const pending = queue.filter((d) => !d.isCurrent);

  if (pending.length === 0) return null;

  // Auto-expand when paused with pending
  const shouldShow = isPaused ? true : expanded;
  const isExpanded = isPaused || expanded;

  return (
    <section className="rounded-[26px] bg-card border border-line shadow-xs p-5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 outline-none"
        aria-expanded={isExpanded}
      >
        <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
          Próximos na fila ({pending.length})
        </h2>
        <span className="w-8 h-8 rounded-full bg-wash flex items-center justify-center text-chrome-icon shrink-0">
          <Icon
            name="alt-arrow-down"
            size={16}
            strokeWidth={2}
            className={`transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isExpanded && (
        <ul className="mt-4 divide-y divide-line">
          {pending.slice(0, 5).map((donation, idx) => (
            <li key={donation.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="w-5 text-center text-[11px] font-extrabold text-ink-label shrink-0">
                {idx + 1}
              </span>
              <img
                src="/default-avatar.svg"
                alt={donation.name}
                className="h-8 w-8 rounded-full object-cover border border-white shadow-2xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-ink-heading truncate">
                    {donation.name}
                  </span>
                  <span className="ml-auto text-xs font-extrabold text-ink-heading">
                    {formatAmount(donation.amount)}
                  </span>
                </div>
                {donation.isTest && (
                  <span className="mt-0.5 inline-flex items-center rounded-full bg-[#f4f5f8] text-[#707684] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                    Teste
                  </span>
                )}
                {donation.message && (
                  <p className="mt-0.5 text-xs font-medium text-ink-secondary line-clamp-1">
                    {donation.message}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isPaused && !expanded && pending.length > 0 && (
        <p className="mt-2 text-xs font-medium text-ink-secondary">
          Fila com {pending.length} {pending.length === 1 ? "doação" : "doações"} aguardando.
        </p>
      )}
    </section>
  );
}
