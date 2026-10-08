import { Suspense, lazy } from "react";
import { Link } from "react-router";
import type { DashboardRange, DashboardStats } from "~/api/modules/dashboard";
import { Icon } from "~/components/ui/Icon";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatDeltaPct } from "./format";
import { formatBRLReais } from "~/util/currency";
import { SegmentedControl } from "~/components/ui/SegmentedControl";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { PeriodFilter } from "./PeriodFilter";
import type { ChartMode } from "./RevenueAreaChart";

const RevenueAreaChart = lazy(() =>
  import("./RevenueAreaChart").then((m) => ({ default: m.RevenueAreaChart })),
);

interface SummaryCardProps {
  stats: DashboardStats | null;
  mode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  loading?: boolean;
}

function DeltaPill({ value, label }: { value: number | null; label: string }) {
  const text = formatDeltaPct(value);
  if (text === null) {
    return null;
  }
  const tone =
    value !== null && value > 0
      ? "bg-success/10 text-success"
      : value !== null && value < 0
        ? "bg-error/10 text-error"
        : "bg-wash text-ink-secondary";
  return (
    <span
      title={label}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ${tone}`}
    >
      {text}
    </span>
  );
}

export function SummaryCard({ stats, mode, onModeChange, range, onRangeChange, loading = false }: SummaryCardProps) {
  const rangeLabel =
    stats?.range === "15" ? "15 dias" : stats?.range === "30" ? "30 dias" : "7 dias";

  return (
    <section aria-label="Recebimentos no período">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={SECTION_HEADING_CLASS}>
          Recebido · últimos {rangeLabel}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter value={range} onChange={onRangeChange} size="sm" />
          <SegmentedControl
            options={[
              { value: "amount", label: "Valor" },
              { value: "count", label: "Qtd" },
            ]}
            value={mode}
            onChange={onModeChange}
            label="Métrica do resumo"
            size="sm"
          />
        </div>
      </div>

      {loading || !stats ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-12 w-56 rounded-2xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 rounded-full" />
          <Skeleton className="h-[220px] w-full rounded-[28px]" />
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <p className="text-[40px] sm:text-[48px] leading-none font-extrabold tracking-tight text-ink-heading">
              {mode === "amount"
                ? formatBRLReais(stats.totalAmount)
                : `${stats.totalCount} ${stats.totalCount === 1 ? "doação" : "doações"}`}
            </p>
            <DeltaPill
              value={mode === "amount" ? stats.deltaAmountPct : stats.deltaCountPct}
              label="Variação em relação aos dias anteriores ao período"
            />
          </div>

          <p className="mt-2 text-sm font-medium text-ink-secondary leading-relaxed">
            {mode === "amount" ? (
              <>
                <strong className="font-bold text-ink-heading">
                  {stats.totalCount} {stats.totalCount === 1 ? "doação" : "doações"}
                </strong>
                {" · "}ticket médio{" "}
                <strong className="font-bold text-ink-heading">
                  {formatBRLReais(stats.average)}
                </strong>
              </>
            ) : (
              <>
                <strong className="font-bold text-ink-heading">
                  {formatBRLReais(stats.totalAmount)}
                </strong>
                {" · "}ticket médio{" "}
                <strong className="font-bold text-ink-heading">
                  {formatBRLReais(stats.average)}
                </strong>
              </>
            )}
            {stats.largest && (
              <>
                {" · "}maior{" "}
                <strong className="font-bold text-ink-heading">
                  {formatBRLReais(stats.largest.amount)} de {stats.largest.donorName}
                </strong>
              </>
            )}
          </p>

          <div className={`mt-5 ${CARD_CLASS}`}>
            <Suspense fallback={<Skeleton className="h-[220px] w-full rounded-2xl" />}>
              <RevenueAreaChart series={stats.series} mode={mode} />
            </Suspense>
          </div>

          <Link
            to="/doacoes"
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-info hover:underline outline-none"
          >
            Ver histórico completo
            <Icon name="alt-arrow-right" size={14} strokeWidth={2} />
          </Link>
        </>
      )}
    </section>
  );
}
