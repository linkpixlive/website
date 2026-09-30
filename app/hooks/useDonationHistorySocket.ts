import { useEffect, useRef, useState } from "react";
import type { DonationHistory } from "~/api/modules/dashboard";
import type { PaginatedResponse } from "~/api/modules/withdrawals";
import {
  matchesFilters,
  type HistoryFilters,
} from "~/util/history-filters";
import { useDashboardSocket } from "./useDashboardSocket";

interface HistoryState {
  items: DonationHistory[];
  total: number;
}

export type HistoryEvent =
  | { type: "created"; donation: DonationHistory }
  | { type: "updated"; donation: DonationHistory };

/** Reducer puro dos eventos ao vivo (testável sem socket). */
export function applyHistoryEvent(
  state: HistoryState,
  event: HistoryEvent,
  opts: { filters?: HistoryFilters; page: number; limit: number },
): HistoryState {
  const { filters, page, limit } = opts;

  if (event.type === "created") {
    if (!matchesFilters(event.donation, filters)) return state;
    if (state.items.some((d) => d.id === event.donation.id)) return state;
    return {
      total: state.total + 1,
      items:
        page === 1
          ? [event.donation, ...state.items].slice(0, limit)
          : state.items,
    };
  }

  const stillMatches = matchesFilters(event.donation, filters);
  const exists = state.items.some((d) => d.id === event.donation.id);
  if (exists && !stillMatches) {
    // Saiu do filtro (ex.: paid → displayed filtrando paid).
    return {
      total: Math.max(0, state.total - 1),
      items: state.items.filter((d) => d.id !== event.donation.id),
    };
  }
  if (!exists && stillMatches) {
    // Passou a casar (raro).
    return {
      total: state.total + 1,
      items:
        page === 1
          ? [event.donation, ...state.items].slice(0, limit)
          : state.items,
    };
  }
  return {
    ...state,
    items: state.items.map((d) =>
      d.id === event.donation.id ? { ...d, ...event.donation } : d,
    ),
  };
}

export function useDonationHistorySocket(
  token: string | null,
  initial: PaginatedResponse<DonationHistory>,
  currentPage: number,
  filters?: HistoryFilters,
  enabled = true,
): HistoryState {
  const [state, setState] = useState<HistoryState>({
    items: initial.items,
    total: initial.meta.total,
  });

  // Sync when initial changes due to navigation (page change)
  useEffect(() => {
    setState({ items: initial.items, total: initial.meta.total });
  }, [initial.items, initial.meta.total, currentPage]);

  // Lidos via ref: o socket conecta uma vez por token, sem reconectar
  // a cada keystroke de filtro ou troca de página.
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;
  const limitRef = useRef(initial.meta.limit);
  limitRef.current = initial.meta.limit;

  const socket = useDashboardSocket(token, enabled);

  useEffect(() => {
    if (!socket) return;

    const dispatch = (event: HistoryEvent) =>
      setState((prev) =>
        applyHistoryEvent(prev, event, {
          filters: filtersRef.current,
          page: pageRef.current,
          limit: limitRef.current,
        }),
      );

    const onCreated = (donation: DonationHistory) =>
      dispatch({ type: "created", donation });
    const onUpdated = (donation: DonationHistory) =>
      dispatch({ type: "updated", donation });

    socket.on("donation:created", onCreated);
    socket.on("donation:updated", onUpdated);

    return () => {
      socket.off("donation:created", onCreated);
      socket.off("donation:updated", onUpdated);
    };
  }, [socket]);

  return state;
}
