import { useState } from "react";
import { overlayApi } from "~/api/modules/overlay";
import { useToast } from "~/contexts/useToast";
import type { OverlayDonationEntity } from "~/types/queue";

export interface ConfirmTarget {
  index: number;
  id: string | undefined;
}

export function useConfirmRemove(
  queue: OverlayDonationEntity[],
  token: string | null,
) {
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null);
  const [removing, setRemoving] = useState(false);
  const { toast } = useToast();

  const handleConfirmClick = (donation: OverlayDonationEntity, index: number) => {
    setConfirm({ index, id: donation.id });
  };

  const resetConfirm = () => {
    setConfirm(null);
  };

  const handleRemove = async () => {
    if (!confirm) return;
    const target = queue[confirm.index];
    if (!target || target.id !== confirm.id) {
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

  return {
    confirm,
    removing,
    handleConfirmClick,
    handleRemove,
    resetConfirm,
  };
}
