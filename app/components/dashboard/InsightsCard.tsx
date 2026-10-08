import type { DashboardStats } from "~/api/modules/dashboard";
import {
  formatPeakDateBR,
  formatPeakDayWithArticle,
  formatPeakHour,
} from "./format";
import { formatBRLReais } from "~/util/currency";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";

interface InsightsCardProps {
  stats: DashboardStats | null;
}

export function InsightsCard({ stats }: InsightsCardProps) {
  const day = formatPeakDayWithArticle(stats?.peakDay ?? null);
  const hour = formatPeakHour(stats?.peakHour);
  const date = formatPeakDateBR(stats?.peakDate ?? null);
  const count = stats?.peakCount ?? null;
  const hasPeak = day !== null && hour !== null;
  const hourPrep =
    hour === "meio-dia" ? "do" : hour === "meia-noite" ? "da" : "das";

  return (
    <section aria-label="Insights">
      <span className={SECTION_HEADING_CLASS}>
        Insights
      </span>
      {!stats || (!hasPeak && stats.modeAmount === null) ? (
        <p className="mt-2 text-sm font-medium text-ink-secondary leading-relaxed">
          Sem dados suficientes ainda. O padrão aparece após as primeiras doações.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {hasPeak && (
            <p className="text-[13px] font-medium text-ink-secondary leading-relaxed">
              Seu pico de doações nos últimos 30 dias foi{" "}
              <strong className="font-bold text-ink-heading">
                {day}
                {date !== null ? ` (${date})` : ""}, por volta {hourPrep}{" "}
                {hour}
                {count !== null && count > 0
                  ? `, com total de ${count} ${count === 1 ? "contribuição" : "contribuições"}`
                  : ""}
              </strong>
              {
                ". Vale analisar seu conteúdo nesse horário para atingir novos picos."
              }
            </p>
          )}
          {stats.modeAmount !== null && (
            <p className="text-[13px] font-medium text-ink-secondary leading-relaxed">
              O valor mais frequente foi{" "}
              <strong className="font-bold text-ink-heading">
                {formatBRLReais(stats.modeAmount)}
              </strong>
              {". "}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
