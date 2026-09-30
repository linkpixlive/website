import { useEffect, useRef, useState } from "react";
import type { DonationHistory } from "~/api/modules/dashboard";
import type { PaginatedResponse } from "~/api/modules/withdrawals";
import { matchesFilters, type HistoryFilters } from "~/util/history-filters";
import { useDashboardSocket } from "./useDashboardSocket";

interface HistoryState {
  items: DonationHistory[];
  total: number;
}

export type HistoryEvent =
  | { type: "created"; donation: DonationHistory }
  | { type: "updated"; donation: DonationHistory };

/** Pure reducer that merges a live donation event into history state. Applies current filters and pagination limits. */
export function applyHistoryEvent(
  state: HistoryState,
  event: HistoryEvent,
  opts: { filters?: HistoryFilters; page: number; limit: number },
): HistoryState {
  const { filters, page, limit } = opts;
  const matches = matchesFilters(event.donation, filters);
  const exists = state.items.some((d) => d.id === event.donation.id);

  if (event.type === "created") {
    if (!matches || exists) return state;
    return insert(state, event.donation, page, limit);
  }

  if (exists && !matches) {
    return {
      total: Math.max(0, state.total - 1),
      items: state.items.filter((d) => d.id !== event.donation.id),
    };
  }
  if (!exists) {
    if (!matches) return state;
    return insert(state, event.donation, page, limit);
  }
  return {
    ...state,
    items: state.items.map((d) =>
      d.id === event.donation.id ? { ...d, ...event.donation } : d,
    ),
  };
}

function insert(
  state: HistoryState,
  donation: DonationHistory,
  page: number,
  limit: number,
): HistoryState {
  return {
    total: state.total + 1,
    items:
      page === 1 ? [donation, ...state.items].slice(0, limit) : state.items,
  };
}

/** Live donation history synced over socket. Reads filters via ref to avoid reconnecting on every keystroke. */
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

  useEffect(() => {
    setState({ items: initial.items, total: initial.meta.total });
  }, [initial.items, initial.meta.total, currentPage]);

  const optsRef = useRef({ filters, page: currentPage, limit: initial.meta.limit });
  optsRef.current = { filters, page: currentPage, limit: initial.meta.limit };

  const socket = useDashboardSocket(token, enabled);

  useEffect(() => {
    if (!socket) return;

    const dispatch = (event: HistoryEvent) =>
      setState((prev) => applyHistoryEvent(prev, event, optsRef.current));

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
