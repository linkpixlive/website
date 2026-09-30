import type { components } from "../generated/api-schema";
import { createApiClient, fetchApi } from "../http/client";
import { pixKeysApi, type PixKey } from "./pix-keys";
import {
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

export const walletsApi = {
  getBalances: (token?: string | null) =>
    fetchApi<WalletBalances>(createApiClient(token).get("/wallets/balances")),

  /** Agregação da página da carteira (saldos + chaves + saques). Fail-fast:
   *  qualquer fonte com erro derruba o loader (o ErrorBoundary mostra retry)
   *  em vez de exibir saldo zerado ou lista vazia falsos. */
  getWalletPage: async (
    token: string | null,
    filters: WalletPageFilters,
  ): Promise<WalletPage> => {
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

    if (!balRes.success) {
      throw new Response(balRes.error.message, { status: 502 });
    }
    if (!keysRes.success) {
      throw new Response(keysRes.error.message, { status: 502 });
    }
    if (!withRes.success) {
      throw new Response(withRes.error.message, { status: 502 });
    }

    return {
      balances: balRes.data,
      pixKeys: keysRes.data,
      withdrawals: withRes.data,
    };
  },
};
