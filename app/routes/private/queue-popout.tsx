import { useLoaderData } from "react-router";
import { dashboardApi, toHistoryQuery } from "~/api/modules/dashboard";
import { DEFAULT_PAGE_LIMIT } from "~/api/modules/withdrawals";
import { DonationsView } from "~/components/donations/DonationsView";
import { ToastProvider } from "~/contexts/ToastProvider";
import { useAnnouncePopout } from "~/hooks/usePopoutPresence";
import { DEFAULT_HISTORY_DAYS } from "~/util/history-filters";
import { getAuthToken } from "~/util/session.server";
import { getPageParam } from "~/util/search-params";
import { requireValidAuth } from "~/util/auth.server";
import type { Route } from "./+types/queue-popout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Doações — Ao Vivo — LinkPix" },
    {
      name: "description",
      content: "Acompanhe e gerencie as doações em tempo real",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireValidAuth(request);
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

  return {
    token,
    history: res.data,
    page,
    totalPages: res.data.meta.totalPages,
  };
}

export default function QueuePopout() {
  const data = useLoaderData<typeof loader>();
  useAnnouncePopout();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas text-text-primary">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
          <DonationsView loaderData={data} liveEnabled />
        </div>
      </div>
    </ToastProvider>
  );
}
