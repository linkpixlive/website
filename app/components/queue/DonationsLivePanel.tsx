import type {
  DonationHistory,
} from "~/api/modules/dashboard";
import type { PaginatedResponse } from "~/api/http/types";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { DonationHistoryList } from "~/components/history/DonationHistoryList";
import { QueueControlsSection } from "./QueueControlsSection";
import { DonationsSubtitle } from "./DonationsSubtitle";
import { useDonationsPage } from "./useDonationsPage";
import { useInfiniteHistory } from "~/hooks/useInfiniteHistory";
import {
  LINK_CLASS,
} from "~/components/ui/classes";
import { HistorySectionShell } from "~/components/ui/HistorySectionShell";

interface DonationsLivePanelProps {
  token: string | null;
  initialHistory: PaginatedResponse<DonationHistory>;
}

/**
 * Espelho operacional da página Doações, usado pelo popup (/fila/popout).
 * Mesmos componentes e visual da página, sem filtros e sem paginação:
 * o histórico é uma lista atualizada em tempo real via socket, com scroll
 * infinito para carregar doações mais antigas.
 */
export function DonationsLivePanel({
  token,
  initialHistory,
}: DonationsLivePanelProps) {
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
  } = useDonationsPage({ token, history: initialHistory, page: 1 });

  const displayTotal = liveTotal;

  const { olderItems, loadingMore, sentinelRef } = useInfiniteHistory(
    token,
    initialHistory,
    liveItems,
  );

  const displayItems = [...liveItems, ...olderItems];

  const handleOpenFullHistory = () => {
    const opener = window.opener;
    if (opener && !opener.closed) {
      opener.focus();
    } else {
      window.location.href = "/doacoes";
    }
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
        />

        <HistorySectionShell
          title="Histórico recente"
          total={displayTotal}
          ariaLabel="Histórico recente de doações"
          footer={
            <div className="flex justify-center pt-4 border-t border-line mt-5">
              <button
                type="button"
                onClick={handleOpenFullHistory}
                className={`text-xs font-semibold ${LINK_CLASS} cursor-pointer outline-none`}
              >
                Ver histórico completo
              </button>
            </div>
          }
        >
          <DonationHistoryList
            items={displayItems}
            loading={false}
            onReplay={handleReplay}
            replayLoading={replayLoading}
            currentId={currentId}
            token={token}
          />

          <div ref={sentinelRef} aria-hidden="true" />

          {loadingMore && (
            <p className="py-4 text-center text-xs font-semibold text-ink-muted">
              Carregando mais doações…
            </p>
          )}
        </HistorySectionShell>
      </div>
    </div>
  );
}
