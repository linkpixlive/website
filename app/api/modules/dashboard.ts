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

/** Agregação da home (8 fontes, tolerante a falha individual). */
export async function getHomePage(
  token: string | null,
  range: DashboardRange,
): Promise<HomePageData> {
  const [statsRes, balancesRes, withdrawalsRes, pixKeysRes, rulesRes, overlayRes, accountRes, historyRes] =
    await Promise.allSettled([
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

  return {
    stats: statsRes.status === "fulfilled" && statsRes.value.success ? statsRes.value.data : null,
    balances:
      balancesRes.status === "fulfilled" && balancesRes.value.success ? balancesRes.value.data : null,
    lastWithdrawal:
      withdrawalsRes.status === "fulfilled" && withdrawalsRes.value.success
        ? (withdrawalsRes.value.data.items[0] ?? null)
        : null,
    pixKeys: pixKeysRes.status === "fulfilled" && pixKeysRes.value.success ? pixKeysRes.value.data : [],
    rules: rulesRes.status === "fulfilled" && rulesRes.value.success ? rulesRes.value.data : null,
    overlay:
      overlayRes.status === "fulfilled" && overlayRes.value.success ? overlayRes.value.data : null,
    account:
      accountRes.status === "fulfilled" && accountRes.value.success ? accountRes.value.data : null,
    recent:
      historyRes.status === "fulfilled" && historyRes.value.success ? historyRes.value.data.items : [],
  };
}
