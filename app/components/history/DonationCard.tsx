import type { DonationHistory } from "~/api/modules/dashboard";
import { dashboardApi } from "~/api/modules/dashboard";
import { Icon } from "~/components/ui/Icon";
import { Badge } from "~/components/ui/Badge";
import { AudioPlayer } from "~/components/ui/AudioPlayer";
import { CurrentBadge } from "~/components/ui/QueueBadges";
import { formatBRLReais, buildDownloadName, formatDateTime } from "~/util/currency";
import { isSafeMediaUrl } from "~/util/safe-url";

interface DonationCardProps {
  item: DonationHistory;
  isCurrent?: boolean;
  onReplay?: (id: string) => void;
  replayLoading?: boolean;
  token?: string | null;
}

function mapStatus(status: string): { badge: string; label: string } {
  if (status === "paid") return { badge: "pending", label: "Não exibido" };
  if (status === "displayed") return { badge: "success", label: "Exibido" };
  return { badge: status, label: status };
}

export function DonationCard({
  item,
  isCurrent = false,
  onReplay,
  replayLoading = false,
  token = null,
}: DonationCardProps) {
  const mapped = mapStatus(item.status);

  return (
    <article
      className={`rounded-2xl p-3 sm:p-3.5 ${isCurrent ? "bg-yellow-wash/60 dark:bg-warning/10" : "bg-wash"}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text-[15px] font-bold text-ink-heading">
          {item.name}
        </h3>
        <span className="shrink-0 text-sm font-extrabold text-ink-heading">
          {formatBRLReais(item.amount)}
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {item.approvedAt && (
          <span className="text-[11px] font-semibold text-ink-label">
            {formatDateTime(item.approvedAt)}
          </span>
        )}
        {isCurrent ? (
          <CurrentBadge size="sm" title={mapped.label} />
        ) : (
          <Badge status={mapped.badge}>{mapped.label}</Badge>
        )}
      </div>

      {item.message && (
        <p className="mt-2 text-[15px] font-medium text-ink-secondary leading-relaxed whitespace-pre-line wrap-anywhere">
          {item.message}
        </p>
      )}

      {(item.voiceUrl || onReplay) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {item.voiceUrl && isSafeMediaUrl(item.voiceUrl) && (
            <div className="min-w-0 flex-1 basis-48 max-w-[320px]">
              <AudioPlayer
                src={item.voiceUrl}
                downloadName={buildDownloadName(item)}
                getDownloadBlob={() =>
                  dashboardApi.downloadAudio(token, item.id)
                }
              />
            </div>
          )}
          {onReplay && (
            <div className="ml-auto shrink-0">
              <button
                type="button"
                onClick={() => onReplay(item.id)}
                disabled={replayLoading}
                className="inline-flex items-center justify-center gap-1.5 px-4 h-10 text-xs font-bold rounded-full bg-card border border-line text-ink-body hover:bg-tile active:scale-[0.98] transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60 disabled:cursor-wait shrink-0"
              >
                <Icon name="repeat-one" size={16} strokeWidth={2} />
                {replayLoading ? "Repetindo…" : "Repetir"}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
