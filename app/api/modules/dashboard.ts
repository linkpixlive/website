import { createApiClient, fetchApi } from "../http/client";
import type { PaginatedResponse } from "./withdrawals";

export interface DonationHistory {
  id: string;
  name: string;
  amount: number;
  message: string | null;
  messageRaw: string | null;
  voiceUrl: string | null;
  messageType: "audio" | "text" | null;
  status: "pending" | "paid" | "displayed" | "failed" | "expired";
  approvedAt: string | null;
}

export interface DashboardHistoryFilters {
  page?: number;
  limit?: number;
  status?: string;
  days?: string;
  search?: string;
  searchBy?: string;
}

export const dashboardApi = {
  getHistory: (
    token: string | null | undefined,
    query?: DashboardHistoryFilters
  ) =>
    fetchApi<PaginatedResponse<DonationHistory>>(
      createApiClient(token).get("/dashboard/history", { params: query })
    ),
};
