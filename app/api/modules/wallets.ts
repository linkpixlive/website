import { createApiClient, fetchApi } from "../http/client";

export interface WalletBalances {
  available: number;
  blocked: number;
  pending: number;
}

export const walletsApi = {
  getBalances: (token?: string | null) =>
    fetchApi<WalletBalances>(createApiClient(token).get("/wallets/balances")),
};
