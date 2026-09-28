import { useLoaderData } from "react-router";
import type { Route } from "./+types/queue-popout";
import { getAuthToken } from "~/util/session.server";
import { requireValidAuth } from "~/util/auth.server";
import { dashboardApi, type DonationHistory } from "~/api/modules/dashboard";
import type { PaginatedResponse } from "~/api/modules/withdrawals";
import { DEFAULT_HISTORY_DAYS } from "~/util/history-filters";
import { ToastProvider } from "~/components/ui/ToastProvider";
import { DonationsLivePanel } from "~/components/queue/DonationsLivePanel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Doações — Ao Vivo — LinkPix" },
    { name: "description", content: "Acompanhe e gerencie as doações em tempo real" },
  ];
}

const POPOUT_HISTORY_LIMIT = 20;

export async function loader({ request }: Route.LoaderArgs) {
  await requireValidAuth(request);
  const token = getAuthToken(request);

  let history: PaginatedResponse<DonationHistory> = {
    items: [],
    meta: {
      total: 0,
      page: 1,
      limit: POPOUT_HISTORY_LIMIT,
      totalPages: 1,
    },
  };

  try {
    const res = await dashboardApi.getHistory(token, {
      page: 1,
      limit: POPOUT_HISTORY_LIMIT,
      days: DEFAULT_HISTORY_DAYS,
    });
    if (res.success) {
      history = res.data;
    }
  } catch (err) {
    console.error("Popout loader fetch error:", err);
  }

  return { token, history };
}

export default function QueuePopout() {
  const { token, history } = useLoaderData<typeof loader>();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas text-text-primary">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
          <DonationsLivePanel token={token} initialHistory={history} />
        </div>
      </div>
    </ToastProvider>
  );
}
