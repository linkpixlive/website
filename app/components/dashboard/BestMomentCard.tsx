import type { DashboardStats } from "~/api/modules/dashboard";
import { Icon } from "~/components/ui/Icon";
import {
  formatCurrency,
  formatPeakDayWithArticle,
  formatPeakHour,
} from "./format";

interface BestMomentCardProps {
  stats: DashboardStats | null;
}

export function BestMomentCard({ stats }: BestMomentCardProps) {
  const day = formatPeakDayWithArticle(stats?.peakDay ?? null);
  const hour = formatPeakHour(stats?.peakHour);
  const hasPeak = day !== null && hour !== null;
  const hourPrep =
    hour === "meio-dia" ? "do" : hour === "meia-noite" ? "da" : "das";

  return (
    <div className="h-full rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-3">
        Melhor momento
      </span>
      {!stats || (!hasPeak && stats.modeAmount === null) ? (
        <p className="text-sm font-medium text-ink-secondary leading-relaxed">
          Sem dados suficientes ainda. O padrão aparece após as primeiras doações.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {hasPeak && (
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-[12px] bg-tile flex items-center justify-center text-chrome-icon shrink-0">
                <Icon name="calendar" size={16} strokeWidth={2} />
              </span>
              <p className="text-[13px] font-medium text-ink-secondary leading-relaxed">
                Seu pico é{" "}
                <strong className="font-bold text-ink-heading">
                  {day}, por volta {hourPrep} {hour}
                </strong>{" "}
                — vale concentrar suas lives nesse horário.
              </p>
            </div>
          )}
          {stats.modeAmount !== null && (
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-[12px] bg-tile flex items-center justify-center text-chrome-icon shrink-0">
                <Icon name="card" size={16} strokeWidth={2} />
              </span>
              <p className="text-[13px] font-medium text-ink-secondary leading-relaxed">
                O valor mais frequente é{" "}
                <strong className="font-bold text-ink-heading">
                  {formatCurrency(stats.modeAmount)}
                </strong>{" "}
                — bom candidato a valor mínimo ou sugestão na sua página.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
