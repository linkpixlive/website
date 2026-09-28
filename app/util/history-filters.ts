import type {
  DashboardHistoryDays,
  DonationHistory,
} from "~/api/modules/dashboard";

export const DEFAULT_HISTORY_DAYS: DashboardHistoryDays = "30";

export interface HistoryFilters {
  status?: string;
  days?: string;
  search?: string;
  searchBy?: string;
}

/** Filtro local dos itens ao vivo via socket (mesma regra do backend). */
export function matchesFilters(
  donation: DonationHistory,
  filters?: HistoryFilters,
): boolean {
  if (filters?.status && donation.status !== filters.status) return false;
  const daysFilter = filters?.days || DEFAULT_HISTORY_DAYS;
  if (["7", "15", "30"].includes(daysFilter)) {
    const daysNum = parseInt(daysFilter, 10);
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const start = new Date(now);
    start.setDate(now.getDate() - daysNum + 1);
    start.setHours(0, 0, 0, 0);
    if (!donation.approvedAt) return false;
    const approved = new Date(donation.approvedAt);
    if (approved < start || approved > end) return false;
  } else if (daysFilter === "today") {
    // "Hoje" = últimas 24h corridas (mesma regra do backend).
    if (!donation.approvedAt) return false;
    const approved = new Date(donation.approvedAt).getTime();
    if (Number.isNaN(approved)) return false;
    if (approved < Date.now() - 24 * 60 * 60 * 1000) return false;
  }
  const term = filters?.search?.trim();
  if (term && term.length >= 2) {
    const by = filters?.searchBy === "message" ? "message" : "name";
    if (by === "message") {
      const msg = donation.message ?? "";
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (!regex.test(msg)) return false;
    } else {
      if (!donation.name.toLowerCase().includes(term.toLowerCase())) return false;
    }
  }
  return true;
}
