import { useState } from "react";
import { useLoaderData, useNavigation, useSearchParams } from "react-router";
import {
  getHomePage,
  type DashboardRange,
  type HomePageData,
} from "~/api/modules/dashboard";
import {
  AccountStatusCard,
  type AccountChecklist,
} from "~/components/dashboard/AccountStatusCard";
import { InsightsCard } from "~/components/dashboard/InsightsCard";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { RecentDonationsCard } from "~/components/dashboard/RecentDonationsCard";
import type { ChartMode } from "~/components/dashboard/RevenueAreaChart";
import { SummaryCard } from "~/components/dashboard/SummaryCard";
import { requireValidAuth } from "~/util/auth.server";
import { getAuthToken } from "~/util/session.server";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Visão geral — LinkPix" },
    {
      name: "description",
      content: "Visão geral de doações, carteira e status da conta",
    },
  ];
}

function parseRange(raw: string | null): DashboardRange {
  return raw === "15" || raw === "30" ? raw : "7";
}

interface HomeLoaderData extends HomePageData {
  token: string | null;
  range: DashboardRange;
  checklist: AccountChecklist | null;
}

export function buildChecklist(data: HomePageData): AccountChecklist {
  const { pixKeys, rules, account } = data;
  return {
    pixCount: pixKeys.length,
    rulesReviewed: rules
      ? rules.minTextAmount !== 1 ||
        rules.minAudioAmount !== 1 ||
        rules.aiModeration ||
        (rules.customRules?.trim().length ?? 0) > 0
      : false,
    has2fa: account?.has2fa ?? false,
    emailVerified:
      account && typeof account.verifiedEmail === "boolean"
        ? account.verifiedEmail
        : null,
  };
}

export async function loader({
  request,
}: Route.LoaderArgs): Promise<HomeLoaderData> {
  await requireValidAuth(request);
  const token = getAuthToken(request);
  const url = new URL(request.url);
  const range = parseRange(url.searchParams.get("range"));

  const page = await getHomePage(token, range);
  const checklist = buildChecklist(page);

  return { token, range, ...page, checklist };
}

export default function Home() {
  const {
    token,
    range,
    stats,
    insights,
    checklist,
    recent,
  } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const [mode, setMode] = useState<ChartMode>("amount");

  const loadingData = navigation.state === "loading";

  const handleRangeChange = (next: DashboardRange) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("range", next);
      return params;
    });
  };

  return (
    <div>
      <PageHeader
        title="Visão geral"
        subtitle={
          "Visão geral de doações, carteira e status da conta."
        }
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-10">
          <SummaryCard
            stats={stats}
            mode={mode}
            onModeChange={setMode}
            range={range}
            onRangeChange={handleRangeChange}
            loading={loadingData}
          />
          <RecentDonationsCard items={recent} token={token} />
        </div>
        <aside className="flex min-w-0 flex-col gap-8 lg:border-l lg:border-line lg:pl-8">
          <AccountStatusCard checklist={checklist} />
          <InsightsCard stats={insights} />
        </aside>
      </div>
    </div>
  );
}
