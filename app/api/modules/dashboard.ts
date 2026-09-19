import { createApiClient, fetchApi } from "../http/client";
import type { PaginatedResponse } from "./withdrawals";

export interface DonationHistory {
  id: string;
  name: string;
  amount: number;
  message: string | null;
  voiceUrl: string | null;
  messageType: "audio" | "text" | null;
  status: "pending" | "paid" | "displayed" | "failed" | "expired";
  approvedAt: string | null;
}

export type DashboardHistoryDays = "today" | "7" | "15" | "30";

export interface DashboardHistoryFilters {
  page?: number;
  limit?: number;
  status?: string;
  days?: DashboardHistoryDays | string;
  search?: string;
  searchBy?: string;
}

export type DashboardRange = "7" | "15" | "30";

export interface DashboardSeriesPoint {
  date: string;
  amount: number;
  count: number;
}

export interface DashboardLargestDonation {
  amount: number;
  donorName: string;
  date: string;
}

export interface DashboardStats {
  range: DashboardRange;
  start: string;
  end: string;
  totalAmount: number;
  totalCount: number;
  average: number;
  largest: DashboardLargestDonation | null;
  previous: { amount: number; count: number };
  deltaAmountPct: number | null;
  deltaCountPct: number | null;
  series: DashboardSeriesPoint[];
  peakDay: number | null;
  peakHour: number | null;
  modeAmount: number | null;
}

export const dashboardApi = {
  getStats: (
    token: string | null | undefined,
    range: DashboardRange = "7",
  ) =>
    fetchApi<DashboardStats>(
      createApiClient(token).get("/dashboard/stats", { params: { range } }),
    ),
  getHistory: (
    token: string | null | undefined,
    query?: DashboardHistoryFilters
  ) =>
    fetchApi<PaginatedResponse<DonationHistory>>(
      createApiClient(token).get("/dashboard/history", { params: query })
    ),
  downloadAudio: (token: string | null | undefined, donationId: string) =>
    createApiClient(token)
      .get(`/dashboard/history/${donationId}/audio`, {
        responseType: "blob",
      })
      .then((res) => res.data as Blob),
};
