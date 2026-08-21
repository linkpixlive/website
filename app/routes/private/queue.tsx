import { useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/queue";
import { getAuthToken } from "~/util/session.server";
import { overlayApi } from "~/api/modules/overlay";
import { useQueueSocket } from "~/hooks/useQueueSocket";
import { useToast } from "~/components/ui/useToast";
import { PageHeader } from "~/components/dashboard/PageHeader";
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
  const token = getAuthToken(request);
  return { token };
}

export default function Queue() {
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

  const handleOpenPopup = () => {
    window.open(
      "/fila/popout",
      "queue_popup",
      "width=900,height=700,resizable=yes",
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Fila de Alertas"
        subtitle="Gerencie a fila de doações em tempo real"
        actions={
          <QueueStatusBadge
            isOverlayOnline={isOverlayOnline}
            isPaused={isPaused}
          />
        }
      />

      <div className="mb-6">
        <QueueToolbar
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onSkip={handleSkip}
          onClear={handleClear}
          onTest={handleTest}
          onOpenPopup={handleOpenPopup}
          loading={actionLoading}
        />
      </div>

      <QueueList
        queue={queue}
        onReplay={handleReplay}
        replayLoading={replayLoading}
      />
    </div>
  );
}
