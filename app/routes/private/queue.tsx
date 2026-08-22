import { useState } from "react";
import { useLoaderData } from "react-router";
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
    <div>
      <PageHeader
        title="Fila de Alertas"
        subtitle={
          queue.length > 0 ? (
            <>
              Você tem{" "}
              <strong className="font-bold text-ink-heading">
                {queue.length} {queue.length === 1 ? "alerta" : "alertas"}
              </strong>{" "}
              na fila de exibição.
            </>
          ) : (
            "Nenhuma doação aguardando exibição."
          )
        }
        actions={
          <QueueStatusBadge
            isOverlayOnline={isOverlayOnline}
            isPaused={isPaused}
          />
        }
      />

      <section
        aria-label="Fila de doações"
        className="rounded-[26px] bg-card border border-gray-100/70 shadow-xs p-5"
      >
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label shrink-0">
            Fila em tempo real
          </h2>

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
      </section>
    </div>
  );
}
