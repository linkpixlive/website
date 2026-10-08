import type { components, operations } from "../generated/api-schema";
import { api, authHeaders, dataOrThrow, fetchApi } from "../http/client";
import type { PaginatedResponse } from "../http/types";
import { accountSettingsApi, type AccountSettings } from "./account-settings";
import { donationSettingsApi, type DonationSettings } from "./donation-settings";
import { pixKeysApi, type PixKey } from "./pix-keys";
import { widgetsApi, type Widget } from "./widgets";

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
      api.get("/dashboard/stats", {
        params: { range },
        headers: authHeaders(token),
      }),
    ),
  getHistory: (
    token: string | null | undefined,
    query?: DashboardHistoryFilters
  ) =>
    fetchApi<PaginatedResponse<DonationHistory>>(
      api.get("/donations/history", {
        params: query,
        headers: authHeaders(token),
      })
    ),
  downloadAudio: (token: string | null | undefined, donationId: string) =>
    api
      .get(`/donations/history/${donationId}/audio`, {
        responseType: "blob",
        headers: authHeaders(token),
      })
      .then((res) => res.data as Blob),
};

export interface HomePageData {
  stats: DashboardStats | null;
  insights: DashboardStats | null;
  pixKeys: PixKey[];
  rules: DonationSettings | null;
  overlay: Widget | null;
  account: AccountSettings | null;
  recent: DonationHistory[];
}

export async function getHomePage(
  token: string | null,
  range: DashboardRange,
): Promise<HomePageData> {
  const [
    statsRes,
    pixKeysRes,
    rulesRes,
    overlayRes,
    accountRes,
    historyRes,
    insightsRes,
  ] = await Promise.all([
    dashboardApi.getStats(token, range),
    pixKeysApi.list(token),
    donationSettingsApi.getSettings(token),
    widgetsApi.getSettings(token, "overlay"),
    accountSettingsApi.getSettings(token),
    dashboardApi.getHistory(token, { page: 1, limit: 5 }),
    range === "30" ? null : dashboardApi.getStats(token, "30"),
  ]);

  if (!rulesRes.success && rulesRes.error.code !== 404) {
    throw new Response(rulesRes.error.message, { status: 502 });
  }
  if (!overlayRes.success && overlayRes.error.code !== 404) {
    throw new Response(overlayRes.error.message, { status: 502 });
  }

  return {
    stats: dataOrThrow(statsRes),
    insights:
      insightsRes === null ? dataOrThrow(statsRes) : dataOrThrow(insightsRes),
    pixKeys: dataOrThrow(pixKeysRes),
    rules: rulesRes.success ? rulesRes.data : null,
    overlay: overlayRes.success ? overlayRes.data : null,
    account: dataOrThrow(accountRes),
    recent: dataOrThrow(historyRes).items,
  };
}
