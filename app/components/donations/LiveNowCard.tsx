import type { OverlayDonationEntity } from "~/types/queue";
import { QueueStatusBadge } from "~/components/queue/QueueStatusBadge";

interface LiveNowCardProps {
  queue: OverlayDonationEntity[];
  isOverlayOnline: boolean;
  isPaused: boolean;
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

export function LiveNowCard({
  queue,
  isOverlayOnline,
  isPaused,
}: LiveNowCardProps) {
  const current = queue.find((d) => d.isCurrent) ?? null;

  return (
    <section
      aria-label="Ao vivo"
      className="rounded-[26px] bg-card border border-line shadow-xs p-5"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
          Ao Vivo
        </h2>
        <QueueStatusBadge
          isOverlayOnline={isOverlayOnline}
          isPaused={isPaused}
        />
      </div>

      {!current ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <h3 className="text-lg font-extrabold tracking-tight text-ink-heading">
            Tudo tranquilo
          </h3>
          <p className="text-sm text-ink-secondary mt-1 max-w-xs">
            Nenhuma doação sendo exibida no momento. As próximas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="-mx-3 px-3 py-3 rounded-2xl bg-[#fff7d6]/50 flex items-center gap-3">
          <img
            src="/default-avatar.svg"
            alt={current.name}
            className="h-9 w-9 rounded-full object-cover border border-white shadow-2xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-ink-heading leading-snug truncate">
                {current.name}
              </span>
              <span className="ml-auto shrink-0 pl-2 text-sm font-extrabold text-ink-heading">
                {formatAmount(current.amount)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-[#fff7d6] text-[#b58a00] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                Exibindo agora
              </span>
              {current.isTest && (
                <span className="inline-flex items-center rounded-full bg-[#f4f5f8] text-[#707684] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                  Teste
                </span>
              )}
            </div>
            {current.message && (
              <p className="mt-1 text-xs font-medium text-ink-secondary leading-snug line-clamp-2">
                {current.message}
              </p>
            )}
            <span className="mt-0.5 block text-[11px] font-semibold text-ink-label">
              {formatTimestamp(current.createdAt)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
