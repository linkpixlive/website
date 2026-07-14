import { createApiClient, fetchApi } from "../http/client";

export interface CreateWithdrawalPayload {
  amount: number;
  pixId: string;
}

export interface WithdrawalFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface Withdrawal {
  id: string;
  pixId: string | null;
  pixValue: string;
  amount: number;
  netAmount: number;
  feeAmount: number;
  status: string;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export const withdrawalsApi = {
  create: (token: string | null | undefined, body: CreateWithdrawalPayload) =>
    fetchApi<Withdrawal>(createApiClient(token).post("/withdrawals", body)),
  list: (token: string | null | undefined, query?: WithdrawalFilters) =>
    fetchApi<PaginatedResponse<Withdrawal>>(
      createApiClient(token).get("/withdrawals", { params: query })
    ),
};
