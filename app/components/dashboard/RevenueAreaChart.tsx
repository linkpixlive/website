import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
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
      {/* O wrapper do recharts recebe foco ao clicar: o anel padrão é suprimido
          aqui porque o gráfico é decorativo (valores na tabela sr-only abaixo). */}
      <div
        className="h-[220px] w-full [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none"
        role="img"
        aria-label={mode === "amount" ? "Evolução do valor recebido por dia" : "Evolução da quantidade de doações por dia"}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
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
              cursor={false}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="var(--color-ink-heading)"
              strokeWidth={2}
              fill="var(--color-wash)"
              fillOpacity={1}
              activeDot={{ r: 4, fill: "var(--color-brand-button)", stroke: "var(--color-on-brand)", strokeWidth: 2 }}
              dot={false}
            />
            {maxPoint && maxPoint[dataKey] > 0 && (
              <ReferenceDot
                x={maxPoint.date}
                 y={maxPoint[dataKey]}
                 r={4}
                 fill="var(--color-brand-button)"
                 stroke="var(--color-on-brand)"
                 strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {!hasData && (
        <p className="mt-2 text-xs font-medium text-ink-muted">
          Sem doações pagas neste período — o gráfico preenche assim que a primeira cair.
        </p>
      )}
      {/* Leitor de tela: tabela com os valores da série. */}
      <table className="sr-only">
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
  );
}
