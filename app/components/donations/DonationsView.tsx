import { useMemo } from "react";
import { useNavigation } from "react-router";
import type { PaginatedResponse } from "~/api/http/types";
import {
  type DonationHistory,
} from "~/api/modules/dashboard";
import { HistoryFilters } from "~/components/donations/HistoryFilters";
import { DonationLedger } from "~/components/donations/DonationLedger";
import { QueueControls } from "~/components/donations/QueueControls";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { useDonationsPage } from "~/components/queue/useDonationsPage";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { Pagination } from "~/components/ui/Pagination";
import { usePageParam } from "~/hooks/usePageParam";
import { DEFAULT_HISTORY_DAYS } from "~/util/history-filters";

interface DonationsViewData {
  token: string | null;
  history: PaginatedResponse<DonationHistory>;
  page: number;
  totalPages: number;
}

interface DonationsViewProps {
  loaderData: DonationsViewData;
  liveEnabled?: boolean;
}

export function DonationsView({
  loaderData,
  liveEnabled = true,
}: DonationsViewProps) {
  const { token, history, page, totalPages } = loaderData;
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
    isOnline,
    liveItems,
    liveTotal,
    actionLoading,
    replayLoading,
    handleTogglePause,
    handleSkip,
    handleClear,
    handleTest,
    handleReplay,
  } = useDonationsPage({ token, history, page, filters, enabled: liveEnabled });

  const loadingData = navigation.state === "loading";
  const displayItems = liveItems;
  const displayTotal = liveTotal;

  const current =
    queue.find((d) => d.isCurrent) ?? (queue.length > 0 ? queue[0] : null);
  const currentId = current?.id ?? null;

  const displayItemsWithCurrent = useMemo(() => {
    if (!current || current.isTest) return displayItems;
    if (displayItems.some((d) => d.id === current.id)) return displayItems;
    const synthesized: DonationHistory = {
      id: current.id,
      name: current.name,
      amount: current.amount,
      message: current.message,
      messageType: (current.messageType as "audio" | "text" | null) ?? null,
      status: "paid",
      voiceUrl: current.audioUrl,
      approvedAt: current.createdAt,
    };
    return [synthesized, ...displayItems];
  }, [current, displayItems]);

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
          isPaused ? (
            <span
              aria-live="polite"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-bold whitespace-nowrap text-yellow-ink"
            >
              <Icon name="pause" size={14} strokeWidth={2.5} />
              Fila pausada, retome para exibir os alertas
            </span>
          ) : isOnline === false ? (
            <span
              aria-live="polite"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-bold whitespace-nowrap text-yellow-ink"
            >
              <Icon name="widget" size={14} strokeWidth={2.5} />
              Overlay offline, as doações não entram na fila
            </span>
          ) : queue.length > 0 ? (
            `No ar · ${queue.length} na fila`
          ) : (
            "Acompanhe e gerencie suas doações."
          )
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTest}
              loading={actionLoading.test}
            >
              <Icon name="test-tube" size={16} strokeWidth={2} />
              Testar alerta
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTogglePause}
              loading={actionLoading.togglePause}
            >
              <Icon
                name={isPaused ? "play" : "pause"}
                size={16}
                strokeWidth={2}
              />
              {isPaused ? "Retomar fila" : "Pausar fila"}
            </Button>
            <Button variant="inverse" size="sm" onClick={handleOpenPopup}>
              <Icon name="square-arrow-right-up" size={16} strokeWidth={2} />
              Abrir popup
            </Button>
          </>
        }
      />

      {isPaused && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning/15 px-4 py-3 animate-slide-down"
        >
          <Icon
            name="pause"
            size={18}
            strokeWidth={2.2}
            className="shrink-0 text-yellow-ink"
          />
          <p className="min-w-0 flex-1 text-[13px] font-bold text-yellow-ink">
            Fila pausada — os alertas não estão sendo exibidos na live.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTogglePause}
            loading={actionLoading.togglePause}
          >
            <Icon name="play" size={16} strokeWidth={2} />
            Retomar fila
          </Button>
        </div>
      )}

      <section aria-label="Histórico de doações" className="mt-8 border-t border-line pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 min-h-[40px]">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink-heading">
            Histórico
            {displayTotal > 0 && (
              <span className="rounded-full bg-wash px-2 py-0.5 text-[11px] font-extrabold text-ink-secondary">
                {displayTotal}
              </span>
            )}
          </h2>

          <QueueControls
            queue={queue}
            token={token}
            isPaused={isPaused}
            skipLoading={actionLoading.skip}
            clearLoading={actionLoading.clear}
            onSkip={handleSkip}
            onClear={handleClear}
          />
        </div>

        <div className="mt-4">
          <HistoryFilters />
        </div>

        <div className="mt-4">
          <DonationLedger
            items={displayItemsWithCurrent}
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
  );
}
