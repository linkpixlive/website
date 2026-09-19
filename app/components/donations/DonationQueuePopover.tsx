import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
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
  // A mesma doação pode aparecer várias vezes na fila (ex. "Repetir"),
  // então a confirmação é identificada pela LINHA clicada (índice), não
  // pelo id — com snapshot do id para validar antes de remover.
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  const [confirmDonationId, setConfirmDonationId] = useState<
    string | undefined
  >(undefined);
  const [removing, setRemoving] = useState(false);
  const { toast } = useToast();

  const pendingCount = queue.length;

  const handleConfirmClick = (
    donation: OverlayDonationEntity,
    index: number,
  ) => {
    setConfirmIndex(index);
    setConfirmDonationId(donation.id);
  };

  const resetConfirm = () => {
    setConfirmIndex(null);
    setConfirmDonationId(undefined);
  };

  const handleRemove = async () => {
    if (confirmIndex === null) return;
    const target = queue[confirmIndex];
    if (!target || target.id !== confirmDonationId) {
      toast("A fila mudou. Selecione o item novamente.", "error");
      resetConfirm();
      return;
    }
    if (!target.id) {
      toast("Não foi possível identificar o item da fila.", "error");
      resetConfirm();
      return;
    }
    setRemoving(true);
    const res = await overlayApi.removeFromQueue(token, target.id);
    setRemoving(false);
    if (res.success) {
      toast("Removido da fila.", "success");
      resetConfirm();
    } else {
      toast(res.error.message, "error");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetConfirm();
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
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
                    const isConfirming = confirmIndex === index;
                    return (
                      <li
                        key={
                          donation.id != null
                            ? `${donation.id}-${index}`
                            : `fila-${index}`
                        }
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
                            {donation.isTest && (
                              <span className="inline-flex items-center rounded-full bg-wash text-ink-secondary border border-line text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 shrink-0">
                                Teste
                              </span>
                            )}
                            <span className="ml-auto text-xs font-extrabold text-ink-heading shrink-0">
                              {formatAmount(donation.amount)}
                            </span>
                          </div>
                          {isCurrent && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center rounded-full bg-yellow-wash text-yellow-ink border border-yellow-wash dark:bg-warning/15 dark:text-warning dark:border-warning/20 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                                Exibindo agora
                              </span>
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
                            onClick={() => handleConfirmClick(donation, index)}
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
                          className="flex items-center gap-2 rounded-xl bg-error/5 border border-error/20 px-2.5 py-1.5 animate-fade-in"
                          title="Ela continuará no histórico e poderá ser repetida depois."
                        >
                          <Icon
                            name="danger-circle"
                            size={14}
                            strokeWidth={2}
                            className="text-error shrink-0"
                          />
                          <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-body">
                            Remover{" "}
                            <span className="font-bold">{donation.name}</span>?
                          </p>
                          <button
                            type="button"
                            onClick={handleRemove}
                            disabled={removing}
                            className="shrink-0 px-2.5 py-1 rounded-full bg-error text-white text-[11px] font-bold hover:bg-error-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60 disabled:cursor-wait"
                          >
                            {removing ? "…" : "Sim"}
                          </button>
                          <button
                            type="button"
                            onClick={() => resetConfirm()}
                            disabled={removing}
                            className="shrink-0 px-2.5 py-1 rounded-full bg-wash text-[11px] font-bold text-ink-body hover:bg-wash-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60"
                          >
                            Não
                          </button>
                        </div>
                      )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
  );
}
