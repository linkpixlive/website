import type { components, operations } from "../generated/api-schema";
import { createApiClient, fetchApi } from "../http/client";
import type { PaginatedResponse } from "./withdrawals";
import { accountSettingsApi, type AccountSettings } from "./account-settings";
import { donationSettingsApi, type DonationSettings } from "./donation-settings";
import { pixKeysApi, type PixKey } from "./pix-keys";
import { walletsApi, type WalletBalances } from "./wallets";
import { widgetsApi, type Widget } from "./widgets";
import { withdrawalsApi, type Withdrawal } from "./withdrawals";

export type DonationHistory = components["schemas"]["DonationHistoryEntity"];

export type DashboardHistoryDays = NonNullable<
  NonNullable<
    operations["DonationsController_getHistory"]["parameters"]["query"]
  >["days"]
>;

export type DashboardHistoryFilters = NonNullable<
  operations["DonationsController_getHistory"]["parameters"]["query"]
>;

const HISTORY_STATUSES = ["paid", "displayed"] as const satisfies Exclude<
  DashboardHistoryFilters["status"],
  undefined
>[];

const HISTORY_DAYS_VALUES = ["today", "7", "15", "30"] as const satisfies Exclude<
  DashboardHistoryFilters["days"],
  undefined
>[];

const HISTORY_SEARCH_BY_VALUES = ["name", "message"] as const satisfies Exclude<
  DashboardHistoryFilters["searchBy"],
  undefined
>[];

function oneOf<T extends string>(
  values: readonly T[],
  raw: string | null | undefined,
): T | undefined {
  return raw != null && (values as readonly string[]).includes(raw)
    ? (raw as T)
    : undefined;
}

/**
 * Coage query params crus (URL) para os enums do contrato. Valor fora do
 * enum vira `undefined` (backend responderia 400) em vez de quebrar o tipo.
 */
export function toHistoryQuery(input: {
  page?: number;
  limit?: number;
  status?: string | null;
  days?: string | null;
  search?: string | null;
  searchBy?: string | null;
}): DashboardHistoryFilters {
  const query: DashboardHistoryFilters = {};
  if (input.page !== undefined) query.page = input.page;
  if (input.limit !== undefined) query.limit = input.limit;
  const status = oneOf(HISTORY_STATUSES, input.status);
  if (status !== undefined) query.status = status;
  const days = oneOf(HISTORY_DAYS_VALUES, input.days);
  if (days !== undefined) query.days = days;
  if (input.search) query.search = input.search;
  const searchBy = oneOf(HISTORY_SEARCH_BY_VALUES, input.searchBy);
  if (searchBy !== undefined) query.searchBy = searchBy;
  return query;
}

export type DashboardRange = "7" | "15" | "30";

export type DashboardSeriesPoint =
  components["schemas"]["DashboardSeriesPoint"];

export type DashboardLargestDonation =
  components["schemas"]["DashboardLargestDonation"];

export type DashboardStats = components["schemas"]["DashboardStatsEntity"];

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
      createApiClient(token).get("/donations/history", { params: query })
    ),
  downloadAudio: (token: string | null | undefined, donationId: string) =>
    createApiClient(token)
      .get(`/donations/history/${donationId}/audio`, {
        responseType: "blob",
      })
      .then((res) => res.data as Blob),
};

export interface HomePageData {
  stats: DashboardStats | null;
  balances: WalletBalances | null;
  lastWithdrawal: Withdrawal | null;
  pixKeys: PixKey[];
  rules: DonationSettings | null;
  overlay: Widget | null;
  account: AccountSettings | null;
  recent: DonationHistory[];
}

/** Agregação da home (8 fontes). Fail-fast: erro em fonte crítica derruba o
 *  loader (o ErrorBoundary mostra retry) em vez de exibir número falso.
 *  Exceção: 404 em overlay/regras = "nunca configurado", estado válido de
 *  conta nova que vira `null` para o checklist. */
export async function getHomePage(
  token: string | null,
  range: DashboardRange,
): Promise<HomePageData> {
  const [
    statsRes,
    balancesRes,
    withdrawalsRes,
    pixKeysRes,
    rulesRes,
    overlayRes,
    accountRes,
    historyRes,
  ] = await Promise.all([
    dashboardApi.getStats(token, range),
    walletsApi.getBalances(token),
    withdrawalsApi.list(token, { page: 1, limit: 1 }),
    pixKeysApi.list(token),
    donationSettingsApi.getSettings(token),
    // Leitura pura: getSettings (404 = não configurado). Nunca ensureSettings aqui,
    // que criaria o widget implicitamente.
    widgetsApi.getSettings(token, "overlay"),
    accountSettingsApi.getSettings(token),
    dashboardApi.getHistory(token, { page: 1, limit: 5 }),
  ]);

  if (!statsRes.success) throw new Response(statsRes.error.message, { status: 502 });
  if (!balancesRes.success) {
    throw new Response(balancesRes.error.message, { status: 502 });
  }
  if (!withdrawalsRes.success) {
    throw new Response(withdrawalsRes.error.message, { status: 502 });
  }
  if (!pixKeysRes.success) {
    throw new Response(pixKeysRes.error.message, { status: 502 });
  }
  if (!rulesRes.success && rulesRes.error.code !== 404) {
    throw new Response(rulesRes.error.message, { status: 502 });
  }
  if (!overlayRes.success && overlayRes.error.code !== 404) {
    throw new Response(overlayRes.error.message, { status: 502 });
  }
  if (!accountRes.success) {
    throw new Response(accountRes.error.message, { status: 502 });
  }
  if (!historyRes.success) {
    throw new Response(historyRes.error.message, { status: 502 });
  }

  return {
    stats: statsRes.data,
    balances: balancesRes.data,
    lastWithdrawal: withdrawalsRes.data.items[0] ?? null,
    pixKeys: pixKeysRes.data,
    rules: rulesRes.success ? rulesRes.data : null,
    overlay: overlayRes.success ? overlayRes.data : null,
    account: accountRes.data,
    recent: historyRes.data.items,
  };
}
