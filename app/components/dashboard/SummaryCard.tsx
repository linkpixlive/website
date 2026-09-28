import { Suspense, lazy } from "react";
import { Link } from "react-router";
import type { DashboardStats } from "~/api/modules/dashboard";
import { Icon } from "~/components/ui/Icon";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatDeltaPct } from "./format";
import { formatBRLReais } from "~/util/currency";
import { SegmentedControl } from "~/components/ui/SegmentedControl";
import { CARD_CLASS, ICON_TILE_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import type { ChartMode } from "./RevenueAreaChart";

const RevenueAreaChart = lazy(() =>
  import("./RevenueAreaChart").then((m) => ({ default: m.RevenueAreaChart })),
);

interface SummaryCardProps {
  stats: DashboardStats | null;
  mode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
  loading?: boolean;
}

function DeltaPill({ value, label }: { value: number | null; label: string }) {
  const text = formatDeltaPct(value);
  if (text === null) {
    return (
      <span
        title="Primeiras doações no período — ainda sem base de comparação"
        className="inline-flex items-center rounded-full bg-wash px-2.5 py-1 text-[11px] font-extrabold text-ink-secondary"
      >
        Novo
      </span>
    );
  }
  const tone =
    value !== null && value > 0
      ? "bg-success/10 text-emerald-700"
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

export function SummaryCard({ stats, mode, onModeChange, loading = false }: SummaryCardProps) {
  const rangeLabel =
    stats?.range === "15" ? "15 dias" : stats?.range === "30" ? "30 dias" : "7 dias";

  return (
    <div className={`h-full ${CARD_CLASS} flex flex-col`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={SECTION_HEADING_CLASS}>
          Recebido · últimos {rangeLabel}
        </span>
        <SegmentedControl
          options={[
            { value: "amount", label: "Valor" },
            { value: "count", label: "Qtd" },
          ]}
          value={mode}
          onChange={onModeChange}
          label="Métrica do gráfico"
          size="sm"
        />
      </div>

      {loading || !stats ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-44 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[220px] w-full rounded-2xl" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[26px] leading-tight font-extrabold tracking-tight text-ink-heading">
              {formatBRLReais(stats.totalAmount)}
            </span>
            <DeltaPill
              value={mode === "amount" ? stats.deltaAmountPct : stats.deltaCountPct}
              label="Variação em relação aos dias anteriores ao período"
            />
          </div>

          <div className="mt-4">
            <Suspense fallback={<Skeleton className="h-[220px] w-full rounded-2xl" />}>
              <RevenueAreaChart series={stats.series} mode={mode} />
            </Suspense>
          </div>

          <div className="mt-4 pt-4 divide-y divide-line border-t border-line">
            <div className="flex items-center gap-3 py-2.5">
              <span className={ICON_TILE_CLASS}>
                <Icon name="list" size={16} strokeWidth={2} />
              </span>
              <span className="text-[13px] font-medium text-ink-secondary">
                Doações no período
              </span>
              <span className="ml-auto text-sm font-semibold text-ink-body">
                {stats.totalCount} · ticket médio {formatBRLReais(stats.average)}
              </span>
            </div>
            <div className="flex items-center gap-3 py-2.5">
              <span className={ICON_TILE_CLASS}>
                <Icon name="graph" size={16} strokeWidth={2} />
              </span>
              <span className="text-[13px] font-medium text-ink-secondary">
                Maior doação
              </span>
              <span className="ml-auto text-sm font-semibold text-ink-body">
                {stats.largest
                  ? `${formatBRLReais(stats.largest.amount)} · ${stats.largest.donorName}`
                  : "—"}
              </span>
            </div>
          </div>

          <Link
            to="/doacoes"
            className="mt-4 inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-info hover:underline outline-none"
          >
            Ver histórico completo
            <Icon name="alt-arrow-right" size={14} strokeWidth={2} />
          </Link>
        </>
      )}
    </div>
  );
}
