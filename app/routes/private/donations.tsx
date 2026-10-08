import { useLoaderData } from "react-router";
import {
  dashboardApi,
  toHistoryQuery,
} from "~/api/modules/dashboard";
import { DEFAULT_PAGE_LIMIT } from "~/api/modules/withdrawals";
import { DonationsView } from "~/components/donations/DonationsView";
import { useIsPopoutOpen } from "~/hooks/usePopoutPresence";
import { DEFAULT_HISTORY_DAYS } from "~/util/history-filters";
import { getPageParam } from "~/util/search-params";
import { getAuthToken } from "~/util/session.server";
import type { Route } from "./+types/donations";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Doações — LinkPix" },
    { name: "description", content: "Histórico de doações com ao vivo" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  const url = new URL(request.url);
  const page = getPageParam(url);
  const limit = getPageParam(url, "limit", DEFAULT_PAGE_LIMIT);
  const status = url.searchParams.get("status") || undefined;
  const days = url.searchParams.get("days") || DEFAULT_HISTORY_DAYS;
  const search = url.searchParams.get("search") || undefined;
  const searchBy = url.searchParams.get("searchBy") || undefined;

  const res = await dashboardApi.getHistory(
    token,
    toHistoryQuery({ page, limit, status, days, search, searchBy }),
  );
  if (!res.success) {
    throw new Response(res.error.message, { status: 502 });
  }
  const history = res.data;

  return { token, history, page, totalPages: history.meta.totalPages };
}

export default function Donations() {
  const data = useLoaderData<typeof loader>();
  const popoutOpen = useIsPopoutOpen();

  return <DonationsView loaderData={data} liveEnabled={!popoutOpen} />;
}
