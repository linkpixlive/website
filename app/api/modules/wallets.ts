import type { components } from "../generated/api-schema";
import { createApiClient, fetchApi } from "../http/client";
import { pixKeysApi, type PixKey } from "./pix-keys";
import {
  DEFAULT_PAGE_LIMIT,
  toWithdrawalStatus,
  withdrawalsApi,
  type Withdrawal,
  type WithdrawalFilters,
} from "./withdrawals";

export type WalletBalances = components["schemas"]["WalletBalancesEntity"];

export interface WalletPageFilters {
  page: number;
  limit: number;
  status?: WithdrawalFilters["status"];
  startDate?: string;
  endDate?: string;
}

export interface WalletPage {
  balances: WalletBalances;
  pixKeys: PixKey[];
  withdrawals: {
    items: Withdrawal[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export const EMPTY_WALLET_PAGE: WalletPage = {
  balances: { available: 0, pending: 0, blocked: 0 },
  pixKeys: [],
  withdrawals: {
    items: [],
    meta: { total: 0, page: 1, limit: DEFAULT_PAGE_LIMIT, totalPages: 1 },
  },
};

export const walletsApi = {
  getBalances: (token?: string | null) =>
    fetchApi<WalletBalances>(createApiClient(token).get("/wallets/balances")),

  /** Agregação da página da carteira (saldos + chaves + saques). */
  getWalletPage: async (
    token: string | null,
    filters: WalletPageFilters,
  ): Promise<WalletPage> => {
    const page: WalletPage = {
      balances: { ...EMPTY_WALLET_PAGE.balances },
      pixKeys: [],
      withdrawals: {
        items: [],
        meta: { ...EMPTY_WALLET_PAGE.withdrawals.meta },
      },
    };

    try {
      const [balRes, keysRes, withRes] = await Promise.all([
        walletsApi.getBalances(token),
        pixKeysApi.list(token),
        withdrawalsApi.list(token, {
          page: filters.page,
          limit: filters.limit,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ]);

      if (balRes.success) page.balances = balRes.data;
      if (keysRes.success) page.pixKeys = keysRes.data;
      if (withRes.success) page.withdrawals = withRes.data;
    } catch (err) {
      console.error("Loader fetch error:", err);
    }

    return page;
  },
};
