import type { OverlayDonationEntity } from "~/types/queue";
import { Modal } from "~/components/ui/Modal";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatTimestamp(dateString: string) {
  return new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DonationQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: OverlayDonationEntity[];
}

export function DonationQueueModal({
  isOpen,
  onClose,
  queue,
}: DonationQueueModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Fila de exibição • ${queue.length} ${queue.length === 1 ? "alerta" : "alertas"}`} size="lg">
      {queue.length === 0 ? (
        <div className="py-8 text-center">
          <h3 className="text-base font-extrabold tracking-tight text-ink-heading">
            Fila vazia
          </h3>
          <p className="text-sm text-ink-secondary mt-1 max-w-sm mx-auto">
            Nenhuma doação aguardando exibição. As próximas aparecerão aqui em tempo real.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {queue.map((donation, index) => {
            const isCurrent = Boolean(donation.isCurrent);
            return (
              <li
                key={donation.id}
                className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${isCurrent ? "-mx-3 px-3 rounded-2xl bg-yellow-wash/50 dark:bg-warning/10 border border-transparent dark:border-warning/10" : ""}`}
              >
                <span className="w-5 text-center text-[11px] font-extrabold text-ink-label shrink-0">
                  {index + 1}
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
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-full bg-yellow-wash text-yellow-ink border border-yellow-wash dark:bg-warning/15 dark:text-warning dark:border-warning/20 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                          Exibindo agora
                        </span>
                      )}
                      {donation.isTest && (
                        <span className="inline-flex items-center rounded-full bg-wash text-ink-secondary border border-line text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
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
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
