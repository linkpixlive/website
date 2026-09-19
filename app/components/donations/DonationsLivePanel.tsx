import { useCallback, useEffect, useRef, useState } from "react";
import {
  dashboardApi,
  type DonationHistory,
} from "~/api/modules/dashboard";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { DonationHistoryList } from "~/components/donations/DonationHistoryList";
import { DonationQueuePopover } from "~/components/donations/DonationQueuePopover";
import { QueueToolbar } from "~/components/queue/QueueToolbar";
import { useDonationHistorySocket } from "~/hooks/useDonationHistorySocket";
import { useQueueActions } from "~/hooks/useQueueActions";
import { useQueueSocket } from "~/hooks/useQueueSocket";

interface DonationsLivePanelProps {
  token: string | null;
  initialHistory: {
    items: DonationHistory[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
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
  const { queue, isPaused } = useQueueSocket(token);
  const { items: liveItems, total: liveTotal } = useDonationHistorySocket(
    token,
    initialHistory,
    1,
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

  const pendingCount = queue.filter((d) => !d.isCurrent).length;
  const displayTotal = liveTotal;
  const currentId = queue.find((d) => d.isCurrent)?.id ?? null;

  // Scroll infinito: páginas antigas moram num estado separado porque o
  // socket trunca a própria lista no limite do loader a cada evento ao vivo.
  const [olderItems, setOlderItems] = useState<DonationHistory[]>([]);
  const [nextPage, setNextPage] = useState(2);
  const [hasMore, setHasMore] = useState(
    initialHistory.meta.totalPages > 1,
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Espelho mutável para o observer não re-anexar a cada render.
  const loaderStateRef = useRef({ hasMore, loadingMore, nextPage });
  loaderStateRef.current = { hasMore, loadingMore, nextPage };
  const liveIdsRef = useRef(new Set(liveItems.map((d) => d.id)));
  liveIdsRef.current = new Set(liveItems.map((d) => d.id));

  const loadMore = useCallback(async () => {
    const state = loaderStateRef.current;
    if (!token || state.loadingMore || !state.hasMore) return;
    setLoadingMore(true);
    try {
      const res = await dashboardApi.getHistory(token, {
        page: state.nextPage,
        limit: initialHistory.meta.limit,
        days: "30",
      });
      if (res.success) {
        const liveIds = liveIdsRef.current;
        setOlderItems((prev) => {
          const knownIds = new Set([
            ...liveIds,
            ...prev.map((d) => d.id),
          ]);
          const fresh = res.data.items.filter((d) => !knownIds.has(d.id));
          return [...prev, ...fresh];
        });
        setNextPage(state.nextPage + 1);
        setHasMore(state.nextPage < res.data.meta.totalPages);
      }
    } catch (err) {
      console.error("Failed to load older donations:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [token, initialHistory.meta.limit]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

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
                loading={actionLoading}
              />
            </div>
          </div>
        </section>

        <section
          aria-label="Histórico recente de doações"
          className="rounded-[26px] bg-card border border-line shadow-xs p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
              Histórico recente
            </h2>
            {displayTotal > 0 && (
              <span className="text-[11px] font-semibold text-ink-label">
                {displayTotal} {displayTotal === 1 ? "registro" : "registros"}
              </span>
            )}
          </div>

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

          <div className="flex justify-center pt-4 border-t border-line mt-5">
            <button
              type="button"
              onClick={handleOpenFullHistory}
              className="text-xs font-semibold text-info hover:text-blue-700 underline cursor-pointer outline-none"
            >
              Ver histórico completo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
