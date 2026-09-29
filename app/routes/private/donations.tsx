import { useLoaderData, useNavigation } from "react-router";
import { dashboardApi, toHistoryQuery, type DonationHistory } from "~/api/modules/dashboard";
import { DEFAULT_PAGE_LIMIT, type PaginatedResponse } from "~/api/modules/withdrawals";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { DonationHistoryFilters } from "~/components/history/DonationHistoryFilters";
import { DonationHistoryList } from "~/components/history/DonationHistoryList";
import { QueueControlsSection } from "~/components/queue/QueueControlsSection";
import { Pagination } from "~/components/ui/Pagination";
import { DonationsSubtitle } from "~/components/queue/DonationsSubtitle";
import { useDonationsPage } from "~/components/queue/useDonationsPage";
import { usePageParam } from "~/hooks/usePageParam";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { DEFAULT_HISTORY_DAYS } from "~/util/history-filters";
import { getPageParam } from "~/util/search-params";
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
  const page = getPageParam(url);
  const limit = getPageParam(url, "limit", DEFAULT_PAGE_LIMIT);
  const status = url.searchParams.get("status") || undefined;
  // Padrão = últimos 30 dias (teto de retenção, alinhado ao lifecycle do R2).
  const days = url.searchParams.get("days") || DEFAULT_HISTORY_DAYS;
  const search = url.searchParams.get("search") || undefined;
  const searchBy = url.searchParams.get("searchBy") || undefined;

  let history: PaginatedResponse<DonationHistory> = {
    items: [],
    meta: { total: 0, page: 1, limit: DEFAULT_PAGE_LIMIT, totalPages: 1 },
  };

  try {
    const res = await dashboardApi.getHistory(
      token,
      toHistoryQuery({ page, limit, status, days, search, searchBy }),
    );
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
  const { searchParams, handlePageChange } = usePageParam();
  const navigation = useNavigation();
  const filters = {
    status: searchParams.get("status") || undefined,
    days: searchParams.get("days") || DEFAULT_HISTORY_DAYS,
    search: searchParams.get("search") || undefined,
    searchBy: searchParams.get("searchBy") || undefined,
  };
  const {
    queue,
    isPaused,
    liveItems,
    liveTotal,
    pendingCount,
    currentId,
    actionLoading,
    replayLoading,
    handleTogglePause,
    handleSkip,
    handleClear,
    handleTest,
    handleReplay,
  } = useDonationsPage({ token, history, page, filters });

  const loadingData = navigation.state === "loading";
  const displayItems = liveItems;
  const displayTotal = liveTotal;

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
          <DonationsSubtitle
            total={displayTotal}
            queueLength={queue.length}
            pendingCount={pendingCount}
          />
        }
      />

      <div className="flex flex-col gap-5">
        <QueueControlsSection
          queue={queue}
          token={token}
          isPaused={isPaused}
          actionLoading={actionLoading}
          onTogglePause={handleTogglePause}
          onSkip={handleSkip}
          onClear={handleClear}
          onTest={handleTest}
          onOpenPopup={handleOpenPopup}
        />

        <section
          aria-label="Histórico de doações"
          className={CARD_CLASS}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={SECTION_HEADING_CLASS}>
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
