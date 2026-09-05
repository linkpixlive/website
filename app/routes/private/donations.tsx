import { useState } from "react";
import { useLoaderData, useNavigation, useSearchParams } from "react-router";
import { dashboardApi, type DonationHistory } from "~/api/modules/dashboard";
import { overlayApi } from "~/api/modules/overlay";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { DonationHistoryFilters } from "~/components/donations/DonationHistoryFilters";
import { DonationHistoryList } from "~/components/donations/DonationHistoryList";
import { DonationQueuePopover } from "~/components/donations/DonationQueuePopover";
import { QueueStateBanners } from "~/components/donations/QueueStateBanners";
import { QueueToolbar } from "~/components/queue/QueueToolbar";
import { Pagination } from "~/components/ui/Pagination";
import { useToast } from "~/components/ui/useToast";
import { useDonationHistorySocket } from "~/hooks/useDonationHistorySocket";
import { useQueueSocket } from "~/hooks/useQueueSocket";
import { getAuthToken } from "~/util/session.server";
import type { Route } from "./+types/donations";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Doações — LinkPix" },
    { name: "description", content: "Histórico de doações com ao vivo" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "10");
  const status = url.searchParams.get("status") || undefined;
  const days = url.searchParams.get("days") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const searchBy = url.searchParams.get("searchBy") || undefined;

  let history: {
    items: DonationHistory[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  } = {
    items: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  };

  try {
    const res = await dashboardApi.getHistory(token, {
      page,
      limit,
      status,
      days,
      search,
      searchBy,
    });
    if (res.success) {
      history = res.data;
    }
  } catch (err) {
    console.error("Loader fetch error:", err);
  }

  return { token, history, page, totalPages: history.meta.totalPages };
}

export default function Donations() {
  const { token, history, page, totalPages } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const { toast } = useToast();
  const { queue, isOverlayOnline, isPaused } = useQueueSocket(token);
  const filters = {
    status: searchParams.get("status") || undefined,
    days: searchParams.get("days") || undefined,
    search: searchParams.get("search") || undefined,
    searchBy: searchParams.get("searchBy") || undefined,
  };
  const { items: liveItems, total: liveTotal } = useDonationHistorySocket(
    token,
    history,
    page,
    filters,
  );
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [replayLoading, setReplayLoading] = useState<string | null>(null);

  const loadingData = navigation.state === "loading";
  const pendingCount = queue.filter((d) => !d.isCurrent).length;
  const displayItems = liveItems;
  const displayTotal = liveTotal;
  const currentId = queue.find((d) => d.isCurrent)?.id ?? null;

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
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
        title="Doações"
        subtitle={
          displayTotal > 0 ? (
            <>
              Você tem{" "}
              <strong className="font-bold text-ink-heading">
                {displayTotal} {displayTotal === 1 ? "doação" : "doações"}
              </strong>{" "}
              no histórico.
              {pendingCount > 0 && (
                <>
                  {" "}
                  <strong className="font-bold text-ink-heading">
                    {pendingCount} na fila
                  </strong>
                </>
              )}
            </>
          ) : queue.length > 0 ? (
            <>
              Você tem{" "}
              <strong className="font-bold text-ink-heading">
                {queue.length} {queue.length === 1 ? "alerta" : "alertas"}
              </strong>{" "}
              na fila de exibição.
            </>
          ) : (
            "Nenhuma doação recebida ainda."
          )
        }
      />

      <div className="flex flex-col gap-5">
        <QueueStateBanners
          isOverlayOnline={isOverlayOnline}
          isPaused={isPaused}
          pendingCount={pendingCount}
          onResume={handleTogglePause}
          resumeLoading={actionLoading.togglePause}
        />

        <section
          aria-label="Controles da fila"
          className="rounded-[26px] bg-card border border-line shadow-xs p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label shrink-0">
              Controles
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <DonationQueuePopover queue={queue} token={token} />
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
          </div>
        </section>

        <section
          aria-label="Histórico de doações"
          className="rounded-[26px] bg-card border border-line shadow-xs p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
              Histórico
            </h2>
            {displayTotal > 0 && (
              <span className="text-[11px] font-semibold text-ink-label">
                {displayTotal} {displayTotal === 1 ? "registro" : "registros"}
              </span>
            )}
          </div>

          <DonationHistoryFilters />

          <div className="mt-5">
            <DonationHistoryList
              items={displayItems}
              loading={loadingData}
              onReplay={handleReplay}
              replayLoading={replayLoading}
              currentId={currentId}
            />
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>
    </div>
  );
}
