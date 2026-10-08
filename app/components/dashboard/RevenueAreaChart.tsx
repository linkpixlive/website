import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSeriesPoint } from "~/api/modules/dashboard";
import { formatLongDate, formatShortDate } from "./format";
import { formatBRLReais } from "~/util/currency";

export type ChartMode = "amount" | "count";

interface RevenueAreaChartProps {
  series: DashboardSeriesPoint[];
  mode: ChartMode;
}

function ChartTooltip({
  active,
  payload,
  label,
  mode,
}: {
  active?: boolean;
  payload?: { value: number | string }[];
  label?: string;
  mode: ChartMode;
}) {
  if (!active || !payload?.length || !label) return null;
  const raw = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-2xl border border-line bg-card px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-ink-label">
        {formatLongDate(label)}
      </p>
      <p className="text-sm font-extrabold text-ink-heading">
        {mode === "amount" ? formatBRLReais(raw) : `${raw} ${raw === 1 ? "doação" : "doações"}`}
      </p>
    </div>
  );
}

export function RevenueAreaChart({ series, mode }: RevenueAreaChartProps) {
  const dataKey = mode;
  const maxPoint = series.reduce<DashboardSeriesPoint | null>(
    (best, p) => (!best || p[dataKey] > best[dataKey] ? p : best),
    null,
  );
  const hasData = series.some((p) => p.amount > 0 || p.count > 0);

  return (
    <div>
      <div
        className="h-[220px] w-full [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_*]:outline-none [&_*:focus]:outline-none"
        role="img"
        aria-label={mode === "amount" ? "Evolução do valor recebido por dia" : "Evolução da quantidade de doações por dia"}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="28%">
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fontSize: 11, fill: "var(--color-ink-label)", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              width={48}
              tick={{ fontSize: 11, fill: "var(--color-ink-label)", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                mode === "amount"
                  ? v >= 1000
                    ? `R$${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`
                    : `R$${v}`
                  : `${v}`
              }
            />
            <Tooltip
              content={<ChartTooltip mode={mode} />}
              cursor={{ fill: "var(--color-line)", opacity: 0.35 }}
            />
            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
              {series.map((p) => (
                <Cell
                  key={p.date}
                  fill={
                    maxPoint && maxPoint[dataKey] > 0 && p.date === maxPoint.date
                      ? "var(--color-brand-button)"
                      : "var(--color-ink-heading)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!hasData && (
        <p className="mt-2 text-xs font-medium text-ink-muted">
          Sem doações pagas neste período — o gráfico preenche assim que a primeira cair.
        </p>
      )}
      <div className="sr-only">
        <table>
          <caption>Evolução diária no período</caption>
          <tbody>
            {series.map((p) => (
              <tr key={p.date}>
                <th scope="row">{p.date}</th>
                <td>{p.amount}</td>
                <td>{p.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
