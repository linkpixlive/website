import type { DonationHistory } from "~/api/modules/dashboard";
import type { PaginatedResponse } from "~/api/http/types";
import { useDonationHistorySocket } from "~/hooks/useDonationHistorySocket";
import { useQueueActions } from "~/hooks/useQueueActions";
import { useQueueSocket } from "~/hooks/useQueueSocket";
import type { HistoryFilters } from "~/util/history-filters";

interface UseDonationsPageOptions {
  token: string | null;
  history: PaginatedResponse<DonationHistory>;
  page: number;
  filters?: HistoryFilters;
  enabled?: boolean;
}

export function useDonationsPage({
  token,
  history,
  page,
  filters,
  enabled = true,
}: UseDonationsPageOptions) {
  const { queue, isPaused } = useQueueSocket(token, enabled);
  const { items: liveItems, total: liveTotal } = useDonationHistorySocket(
    token,
    history,
    page,
    filters,
    enabled,
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
  const currentId = queue.find((d) => d.isCurrent)?.id ?? null;

  return {
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
  };
}
