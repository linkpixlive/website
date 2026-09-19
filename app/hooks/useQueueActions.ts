import { useState } from "react";
import { overlayApi } from "~/api/modules/overlay";
import { useToast } from "~/components/ui/useToast";

/**
 * Ações da fila de doações compartilhadas entre a página Doações
 * e o popup (/fila/popout). O `isPaused` é recebido de fora para que
 * o socket continue sendo aberto uma única vez por quem usa o hook.
 */
export function useQueueActions(
  token: string | null,
  isPaused: boolean,
) {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [replayLoading, setReplayLoading] = useState<string | null>(null);

  const handleTogglePause = async () => {
    setActionLoading((prev) => ({ ...prev, togglePause: true }));
    const res = await overlayApi.togglePause(token);
    setActionLoading((prev) => ({ ...prev, togglePause: false }));
    if (res.success) {
      toast(isPaused ? "Fila retomada!" : "Fila pausada!", "success");
    } else {
      toast(res.error.message, "error");
    }
  };

  const handleSkip = async () => {
    setActionLoading((prev) => ({ ...prev, skip: true }));
    const res = await overlayApi.skipAlert(token);
    setActionLoading((prev) => ({ ...prev, skip: false }));
    if (res.success) {
      toast(
        isPaused ? "Mensagem removida da fila!" : "Alerta pulado!",
        "success",
      );
    } else {
      toast(res.error.message, "error");
    }
  };

  const handleClear = async () => {
    setActionLoading((prev) => ({ ...prev, clear: true }));
    const res = await overlayApi.clearQueue(token);
    setActionLoading((prev) => ({ ...prev, clear: false }));
    if (res.success) {
      toast("Fila limpa!", "success");
    } else {
      toast(res.error.message, "error");
    }
  };

  const handleTest = async () => {
    setActionLoading((prev) => ({ ...prev, test: true }));
    const res = await overlayApi.testAlert(token);
    setActionLoading((prev) => ({ ...prev, test: false }));
    if (res.success) {
      toast("Alerta de teste enviado!", "success");
    } else {
      toast(res.error.message, "error");
    }
  };

  const handleReplay = async (donationId: string) => {
    setReplayLoading(donationId);
    const res = await overlayApi.replayDonation(token, donationId);
    setReplayLoading(null);
    if (res.success) {
      toast("Doação re-enfileirada!", "success");
    } else {
      toast(res.error.message, "error");
    }
  };

  return {
    actionLoading,
    replayLoading,
    handleTogglePause,
    handleSkip,
    handleClear,
    handleTest,
    handleReplay,
  };
}
