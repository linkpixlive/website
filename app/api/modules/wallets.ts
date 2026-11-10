import type { components } from "../generated/api-schema";
import { api, authHeaders, dataOrThrow, fetchApi } from "../http/client";
import { pixKeysApi, type PixKey } from "./pix-keys";
import {
  withdrawalsApi,
  type Withdrawal,
  type WithdrawalFee,
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
  fee: WithdrawalFee;
  withdrawals: {
    items: Withdrawal[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export const walletsApi = {
  getBalances: (token?: string | null) =>
    fetchApi<WalletBalances>(
      api.get("/wallets/balances", { headers: authHeaders(token) }),
    ),

  getWalletPage: async (
    token: string | null,
    filters: WalletPageFilters,
  ): Promise<WalletPage> => {
    const [balRes, keysRes, withRes, feeRes] = await Promise.all([
      walletsApi.getBalances(token),
      pixKeysApi.list(token),
      withdrawalsApi.list(token, {
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }),
      withdrawalsApi.getFee(token),
    ]);

    return {
      balances: dataOrThrow(balRes),
      pixKeys: dataOrThrow(keysRes),
      fee: dataOrThrow(feeRes),
      withdrawals: dataOrThrow(withRes),
    };
  },
};
