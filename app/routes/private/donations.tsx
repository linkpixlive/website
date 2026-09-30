import { useLoaderData, useNavigation } from "react-router";
import { dashboardApi, toHistoryQuery } from "~/api/modules/dashboard";
import { DEFAULT_PAGE_LIMIT } from "~/api/modules/withdrawals";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { DonationHistoryFilters } from "~/components/history/DonationHistoryFilters";
import { DonationHistoryList } from "~/components/history/DonationHistoryList";
import { QueueControlsSection } from "~/components/queue/QueueControlsSection";
import { Pagination } from "~/components/ui/Pagination";
import { DonationsSubtitle } from "~/components/queue/DonationsSubtitle";
import { useDonationsPage } from "~/components/queue/useDonationsPage";
import { usePageParam } from "~/hooks/usePageParam";
import { useIsPopoutOpen } from "~/hooks/usePopoutPresence";
import { HistorySectionShell } from "~/components/ui/HistorySectionShell";
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
  const days = url.searchParams.get("days") || DEFAULT_HISTORY_DAYS;
  const search = url.searchParams.get("search") || undefined;
  const searchBy = url.searchParams.get("searchBy") || undefined;

  const res = await dashboardApi.getHistory(
    token,
    toHistoryQuery({ page, limit, status, days, search, searchBy }),
  );
  if (!res.success) {
    throw new Response(res.error.message, { status: 502 });
  }
  const history = res.data;

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
  const popoutOpen = useIsPopoutOpen();
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
  } = useDonationsPage({ token, history, page, filters, enabled: !popoutOpen });

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

        <HistorySectionShell
          title="Histórico"
          total={displayTotal}
          ariaLabel="Histórico de doações"
        >
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
        </HistorySectionShell>
      </div>
    </div>
  );
}
