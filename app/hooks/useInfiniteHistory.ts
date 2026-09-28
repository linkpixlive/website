import { useCallback, useEffect, useRef, useState } from "react";
import {
  dashboardApi,
  type DonationHistory,
} from "~/api/modules/dashboard";
import type { PaginatedResponse } from "~/api/modules/withdrawals";
import { DEFAULT_HISTORY_DAYS } from "~/util/history-filters";

/**
 * Scroll infinito do popout: páginas antigas em estado separado porque o
 * socket trunca a própria lista no limite do loader a cada evento ao vivo.
 */
export function useInfiniteHistory(
  token: string | null,
  initialHistory: PaginatedResponse<DonationHistory>,
  liveItems: DonationHistory[],
) {
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
        days: DEFAULT_HISTORY_DAYS,
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

  return { olderItems, loadingMore, sentinelRef };
}
