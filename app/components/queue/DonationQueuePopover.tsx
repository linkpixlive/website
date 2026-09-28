import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import type { OverlayDonationEntity } from "~/types/queue";
import { popupClasses } from "~/components/ui/header-styles";
import { QueueRow } from "./QueueRow";
import { useConfirmRemove } from "./useConfirmRemove";

interface DonationQueuePopoverProps {
  queue: OverlayDonationEntity[];
  token: string | null;
}

export function DonationQueuePopover({
  queue,
  token,
}: DonationQueuePopoverProps) {
  const [open, setOpen] = useState(false);
  const { confirm, removing, handleConfirmClick, handleRemove, resetConfirm } =
    useConfirmRemove(queue, token);

  const pendingCount = queue.length;

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
                  {queue.map((donation, index) => (
                    <QueueRow
                      key={
                        donation.id != null
                          ? `${donation.id}-${index}`
                          : `fila-${index}`
                      }
                      donation={donation}
                      index={index}
                      isConfirming={confirm?.index === index}
                      removing={removing}
                      onConfirmClick={handleConfirmClick}
                      onRemove={handleRemove}
                      onCancel={resetConfirm}
                    />
                  ))}
                </ul>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
  );
}
