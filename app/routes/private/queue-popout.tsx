import { useLoaderData } from "react-router";
import type { Route } from "./+types/queue-popout";
import { getAuthToken } from "~/util/session.server";
import { requireValidAuth } from "~/util/auth.server";
import { dashboardApi } from "~/api/modules/dashboard";
import { DEFAULT_HISTORY_DAYS } from "~/util/history-filters";
import { ToastProvider } from "~/components/ui/ToastProvider";
import { DonationsLivePanel } from "~/components/queue/DonationsLivePanel";
import { useAnnouncePopout } from "~/hooks/usePopoutPresence";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Doações — Ao Vivo — LinkPix" },
    { name: "description", content: "Acompanhe e gerencie as doações em tempo real" },
  ];
}

// Exceção ao DEFAULT_PAGE_LIMIT: popout ao vivo mostra mais itens por tela.
const POPOUT_HISTORY_LIMIT = 20;

export async function loader({ request }: Route.LoaderArgs) {
  await requireValidAuth(request);
  const token = getAuthToken(request);

  const res = await dashboardApi.getHistory(token, {
    page: 1,
    limit: POPOUT_HISTORY_LIMIT,
    days: DEFAULT_HISTORY_DAYS,
  });
  if (!res.success) {
    throw new Response(res.error.message, { status: 502 });
  }

  return { token, history: res.data };
}

export default function QueuePopout() {
  const { token, history } = useLoaderData<typeof loader>();
  useAnnouncePopout();

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
