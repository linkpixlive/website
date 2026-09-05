import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { Modal } from "~/components/ui/Modal";
import { overlayApi } from "~/api/modules/overlay";
import { useToast } from "~/components/ui/useToast";
import type { OverlayDonationEntity } from "~/types/queue";
import { popupClasses } from "~/components/dashboard/header-styles";

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

interface DonationQueuePopoverProps {
  queue: OverlayDonationEntity[];
  token: string | null;
}

export function DonationQueuePopover({
  queue,
  token,
}: DonationQueuePopoverProps) {
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const { toast } = useToast();

  const pendingCount = queue.length;

  const handleRemove = async () => {
    if (!confirmId) return;
    setRemoving(true);
    const res = await overlayApi.removeFromQueue(token, confirmId);
    setRemoving(false);
    if (res.success) {
      toast("Removido da fila.", "success");
      setConfirmId(null);
    } else {
      toast(res.error.message, "error");
    }
  };

  const confirmDonation = confirmId
    ? queue.find((d) => d.id === confirmId)
    : null;

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          render={
            <Button variant="secondary" size="sm">
              <Icon name="list" size={16} strokeWidth={2} />
              Ver fila {pendingCount > 0 ? `(${pendingCount})` : ""}
            </Button>
          }
        />
        <Popover.Portal>
          <Popover.Positioner
            align="end"
            side="bottom"
            sideOffset={8}
            className="z-50"
          >
            <Popover.Popup
              className={`w-[380px] max-w-[92vw] p-4 max-h-[70vh] overflow-y-auto scrollbar-thin ${popupClasses}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold tracking-tight text-ink-heading">
                  Fila de exibição • {queue.length} {queue.length === 1 ? "alerta" : "alertas"}
                </h3>
                <Popover.Close
                  render={
                    <button
                      type="button"
                      className="rounded-full p-1 text-chrome-icon hover:bg-wash hover:text-ink-heading transition-colors outline-none"
                    >
                      <Icon name="close-circle" size={18} strokeWidth={2} />
                    </button>
                  }
                />
              </div>

              {queue.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm font-bold text-ink-heading">Fila vazia</p>
                  <p className="text-xs font-medium text-ink-secondary mt-1">
                    Nenhuma doação aguardando exibição.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {queue.map((donation, index) => {
                    const isCurrent = Boolean(donation.isCurrent);
                    return (
                      <li
                        key={donation.id}
                        className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${isCurrent ? "-mx-2 px-2 rounded-2xl bg-yellow-wash/50 dark:bg-warning/10 border border-transparent dark:border-warning/10" : ""}`}
                      >
                        <span className="w-5 text-center text-[11px] font-extrabold text-ink-label shrink-0">
                          {index + 1}
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
                            <p className="mt-0.5 text-xs font-medium text-ink-secondary line-clamp-1">
                              {donation.message}
                            </p>
                          )}
                          <span className="mt-0.5 block text-[11px] font-semibold text-ink-label">
                            {formatTimestamp(donation.createdAt)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConfirmId(donation.id)}
                          className="w-8 h-8 rounded-full bg-wash hover:bg-error/10 hover:text-error border border-line flex items-center justify-center text-chrome-icon transition-colors shrink-0 outline-none"
                          title="Remover da fila"
                          aria-label={`Remover ${donation.name} da fila`}
                        >
                          <Icon name="trash-bin-minimalistic" size={16} strokeWidth={2} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      <Modal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Remover da fila?"
        size="sm"
      >
        <p className="text-sm font-medium text-ink-secondary leading-snug">
          Remover{" "}
          <span className="font-bold text-ink-heading">
            {confirmDonation?.name ?? "esta doação"}
          </span>{" "}
          da fila? Ela continuará no histórico e poderá ser repetida depois.
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirmId(null)}
            disabled={removing}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleRemove}
            loading={removing}
          >
            <Icon name="trash-bin-minimalistic" size={16} strokeWidth={2} />
            Remover
          </Button>
        </div>
      </Modal>
    </>
  );
}
