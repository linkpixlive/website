import { useState } from "react";
import { overlayApi } from "~/api/modules/overlay";
import { useToast } from "~/contexts/useToast";

export function useQueueActions(
  token: string | null,
  isPaused: boolean,
  setIsPaused: (paused: boolean) => void,
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

  const handleTogglePause = async () => {
    const nextPaused = !isPaused;
    setActionLoading((prev) => ({ ...prev, togglePause: true }));
    setIsPaused(nextPaused);
    const res = await overlayApi.togglePause(token);
    setActionLoading((prev) => ({ ...prev, togglePause: false }));
    if (res.success) {
      setIsPaused(res.data.isPaused);
      toast(nextPaused ? "Fila pausada!" : "Fila retomada!", "success");
    } else {
      setIsPaused(isPaused);
      toast(res.error?.message ?? "Tente novamente.", "error");
    }
  };

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
