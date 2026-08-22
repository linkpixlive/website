import { useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/queue-popout";
import { getAuthToken } from "~/util/session.server";
import { requireValidAuth } from "~/util/auth.server";
import { overlayApi } from "~/api/modules/overlay";
import { useQueueSocket } from "~/hooks/useQueueSocket";
import { useToast } from "~/components/ui/useToast";
import { ToastProvider } from "~/components/ui/ToastProvider";
import { QueueStatusBadge } from "~/components/queue/QueueStatusBadge";
import { QueueToolbar } from "~/components/queue/QueueToolbar";
import { QueueList } from "~/components/queue/QueueList";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Fila de Alertas — LinkPix" },
    { name: "description", content: "Gerencie a fila de doações em tempo real" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireValidAuth(request);
  const token = getAuthToken(request);
  return { token };
}

function QueuePopoutContent() {
  const { token } = useLoaderData<typeof loader>();
  const { queue, isOverlayOnline, isPaused } = useQueueSocket(token);
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
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
      toast("Alerta pulado!", "success");
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

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 shrink-0">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-text-heading leading-tight">
            Fila de Alertas
          </h1>
          <p className="text-xs text-text-primary mt-0.5">
            Fila de doações em tempo real
          </p>
        </div>
        <QueueStatusBadge
          isOverlayOnline={isOverlayOnline}
          isPaused={isPaused}
        />
      </header>

      <div className="px-6 py-3 border-b border-white/10 shrink-0 overflow-x-auto scrollbar-thin">
        <QueueToolbar
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onSkip={handleSkip}
          onClear={handleClear}
          onTest={handleTest}
          loading={actionLoading}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
        <QueueList
          queue={queue}
          onReplay={handleReplay}
          replayLoading={replayLoading}
        />
      </div>
    </div>
  );
}

export default function QueuePopout() {
  return (
    <ToastProvider>
      <QueuePopoutContent />
    </ToastProvider>
  );
}
