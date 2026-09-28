import { useState } from "react";
import { useLoaderData, useNavigation, useSearchParams } from "react-router";
import {
  getHomePage,
  type DashboardRange,
  type HomePageData,
} from "~/api/modules/dashboard";
import { AccountStatusCard, type AccountChecklist } from "~/components/dashboard/AccountStatusCard";
import { BestMomentCard } from "~/components/dashboard/BestMomentCard";
import { formatRangeLabel } from "~/components/dashboard/format";
import { formatBRLReais } from "~/util/currency";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { PeriodFilter } from "~/components/dashboard/PeriodFilter";
import { RecentDonationsCard } from "~/components/dashboard/RecentDonationsCard";
import type { ChartMode } from "~/components/dashboard/RevenueAreaChart";
import { SummaryCard } from "~/components/dashboard/SummaryCard";
import { WalletResumeCard } from "~/components/dashboard/WalletResumeCard";
import { requireValidAuth } from "~/util/auth.server";
import { getAuthToken } from "~/util/session.server";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumo — LinkPix" },
    { name: "description", content: "Resumo de doações, carteira e status da conta" },
  ];
}

function parseRange(raw: string | null): DashboardRange {
  return raw === "15" || raw === "30" ? raw : "7";
}

interface HomeLoaderData extends HomePageData {
  token: string | null;
  range: DashboardRange;
  firstName: string;
  checklist: AccountChecklist | null;
}

/** Derivação pura do checklist a partir dos dados agregados. */
export function buildChecklist(
  data: HomePageData,
  user: { username?: string | null; name?: string | null; profileImageUrl?: string | null } | null,
): AccountChecklist {
  const { pixKeys, rules, overlay, account } = data;
  return {
    pixCount: pixKeys.length,
    rulesReviewed: rules
      ? rules.minTextAmount !== 1 ||
        rules.minAudioAmount !== 1 ||
        rules.aiModeration ||
        (rules.customRules?.trim().length ?? 0) > 0
      : false,
    overlayConfigured: overlay ? overlay.active : false,
    profileComplete: Boolean(user?.username && user?.name && user?.profileImageUrl),
    has2fa: account?.has2fa ?? false,
    emailVerified: account && typeof account.verifiedEmail === "boolean" ? account.verifiedEmail : null,
  };
}

export async function loader({ request }: Route.LoaderArgs): Promise<HomeLoaderData> {
  const user = await requireValidAuth(request);
  const token = getAuthToken(request);
  const url = new URL(request.url);
  const range = parseRange(url.searchParams.get("range"));

  const firstName = String(user?.name ?? "Streamer").trim().split(/\s+/)[0] || "Streamer";

  const page = await getHomePage(token, range);
  const checklist = buildChecklist(page, user);

  return { token, range, firstName, ...page, checklist };
}

export default function Home() {
  const { token, range, firstName, stats, balances, lastWithdrawal, checklist, recent } =
    useLoaderData<typeof loader>();
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
        title={`Resumo, ${firstName}`}
        subtitle={
          stats ? (
            <>
              De {formatRangeLabel(stats.start, stats.end)} você recebeu{" "}
              <strong className="font-bold text-ink-heading">
                {formatBRLReais(stats.totalAmount)} em {stats.totalCount}{" "}
                {stats.totalCount === 1 ? "doação" : "doações"}
              </strong>
              .
            </>
          ) : (
            "Acompanhe seus recebimentos, carteira e pendências da conta."
          )
        }
        actions={<PeriodFilter value={range} onChange={handleRangeChange} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8">
          <SummaryCard stats={stats} mode={mode} onModeChange={setMode} loading={loadingData} />
        </div>
        <aside className="lg:col-span-5 xl:col-span-4">
          <AccountStatusCard checklist={checklist} />
        </aside>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8">
          <RecentDonationsCard items={recent} token={token} loading={loadingData} />
        </div>
        <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
          <WalletResumeCard balances={balances} lastWithdrawal={lastWithdrawal} loading={loadingData} />
          <BestMomentCard stats={stats} />
        </aside>
      </div>
    </div>
  );
}
