import { useState } from "react";
import { overlayApi } from "~/api/modules/overlay";
import { useToast } from "~/contexts/useToast";

/** Queue control actions (pause, skip, clear, test, replay) with per-action loading and toasts. */
export function useQueueActions(
  token: string | null,
  isPaused: boolean,
) {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [replayLoading, setReplayLoading] = useState<string | null>(null);

  const runAction = async (key: string, fn: () => Promise<{ success: boolean; error?: { message: string } }>, okMsg: string) => {
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    const res = await fn();
    setActionLoading((prev) => ({ ...prev, [key]: false }));
    if (res.success) {
      toast(okMsg, "success");
    } else {
      toast(res.error?.message ?? "Tente novamente.", "error");
    }
  };

  const handleTogglePause = () =>
    runAction("togglePause", () => overlayApi.togglePause(token), isPaused ? "Fila retomada!" : "Fila pausada!");

  const handleSkip = () =>
    runAction("skip", () => overlayApi.skipAlert(token), isPaused ? "Mensagem removida da fila!" : "Alerta pulado!");

  const handleClear = () =>
    runAction("clear", () => overlayApi.clearQueue(token), "Fila limpa!");

  const handleTest = () =>
    runAction("test", () => overlayApi.testAlert(token), "Alerta de teste enviado!");

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
