import type { DonationHistory } from "~/api/modules/dashboard";
import { dashboardApi } from "~/api/modules/dashboard";
import { AudioPlayer } from "~/components/ui/AudioPlayer";
import { Icon } from "~/components/ui/Icon";
import {
  buildDownloadName,
  formatBRLReais,
  formatTimestamp,
} from "~/util/currency";
import { isSafeMediaUrl } from "~/util/safe-url";
import {
  DonationStatusPill,
  type DonationStatusTone,
} from "./DonationStatusPill";

interface DonationLedgerRowProps {
  item: DonationHistory;
  isCurrent?: boolean;
  onReplay?: (id: string) => void;
  replayLoading?: boolean;
  token?: string | null;
  now?: number | null;
}

function toneOf(item: DonationHistory, isCurrent: boolean): DonationStatusTone {
  if (isCurrent) return "current";
  if (item.status === "displayed") return "displayed";
  return "queued";
}

export function DonationLedgerRow({
  item,
  isCurrent = false,
  onReplay,
  replayLoading = false,
  token = null,
  now = null,
}: DonationLedgerRowProps) {
  const tone = toneOf(item, isCurrent);
  const time = item.approvedAt ? formatTimestamp(item.approvedAt, now) : null;

  return (
    <li
      className={
        isCurrent ? "-mx-3 rounded-2xl bg-wash px-3 py-4" : "py-4"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink-heading">
          {item.name}
        </p>
        <span className="shrink-0 text-base font-extrabold tabular-nums text-ink-heading">
          {formatBRLReais(item.amount)}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        {time && (
          <span className="shrink-0 text-xs font-semibold whitespace-nowrap text-ink-muted">
            {time}
          </span>
        )}
        <DonationStatusPill tone={tone} />
        {onReplay && (
          <button
            type="button"
            onClick={() => onReplay(item.id)}
            disabled={replayLoading}
            className="ml-auto inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 text-xs font-bold text-ink-secondary transition-colors outline-none hover:text-ink-heading focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            <Icon name="repeat-one" size={16} strokeWidth={2} />
            {replayLoading ? "Repetindo…" : "Repetir"}
          </button>
        )}
      </div>

      {item.message && (
        <p className="mt-1.5 text-sm font-medium leading-relaxed whitespace-pre-line wrap-anywhere text-ink-secondary">
          {item.message}
        </p>
      )}

      {item.voiceUrl && isSafeMediaUrl(item.voiceUrl) && (
        <div className="mt-2.5 min-w-0 max-w-[320px]">
          <AudioPlayer
            src={item.voiceUrl}
            downloadName={buildDownloadName(item)}
            getDownloadBlob={() =>
              dashboardApi.downloadAudio(token, item.id)
            }
          />
        </div>
      )}
    </li>
  );
}
