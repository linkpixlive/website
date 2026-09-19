import { useLoaderData, useNavigation, useSearchParams } from "react-router";
import { dashboardApi, type DonationHistory } from "~/api/modules/dashboard";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { DonationHistoryFilters } from "~/components/donations/DonationHistoryFilters";
import { DonationHistoryList } from "~/components/donations/DonationHistoryList";
import { DonationQueuePopover } from "~/components/donations/DonationQueuePopover";
import { QueueToolbar } from "~/components/queue/QueueToolbar";
import { Pagination } from "~/components/ui/Pagination";
import { useDonationHistorySocket } from "~/hooks/useDonationHistorySocket";
import { useQueueActions } from "~/hooks/useQueueActions";
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
  // Padrão = últimos 30 dias (teto de retenção, alinhado ao lifecycle do R2).
  const days = url.searchParams.get("days") || "30";
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
  const { queue, isPaused } = useQueueSocket(token);
  const filters = {
    status: searchParams.get("status") || undefined,
    days: searchParams.get("days") || "30",
    search: searchParams.get("search") || undefined,
    searchBy: searchParams.get("searchBy") || undefined,
  };
  const { items: liveItems, total: liveTotal } = useDonationHistorySocket(
    token,
    history,
    page,
    filters,
  );
  const {
    actionLoading,
    replayLoading,
    handleTogglePause,
    handleSkip,
    handleClear,
    handleTest,
    handleReplay,
  } = useQueueActions(token, isPaused);

  const loadingData = navigation.state === "loading";
  const pendingCount = queue.filter((d) => !d.isCurrent).length;
  const displayItems = liveItems;
  const displayTotal = liveTotal;
  const currentId = queue.find((d) => d.isCurrent)?.id ?? null;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleOpenPopup = () => {
    window.open(
      "/fila/popout",
      "queue_popup",
      "width=1024,height=800,resizable=yes,scrollbars=yes",
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
              token={token}
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
