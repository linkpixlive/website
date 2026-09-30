import { useState } from "react";
import { dashboardApi, type DonationHistory } from "~/api/modules/dashboard";
import { AudioPlayer } from "~/components/ui/AudioPlayer";
import { Icon } from "~/components/ui/Icon";
import { formatBRLReais, buildDownloadName } from "~/util/currency";
import { isSafeMediaUrl } from "~/util/safe-url";

function formatShortDateTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface RecentDonationRowProps {
  item: DonationHistory;
  token: string | null;
}

export function RecentDonationRow({ item, token }: RecentDonationRowProps) {
  const [audioOpen, setAudioOpen] = useState(false);
  const date = formatShortDateTime(item.approvedAt);

  return (
    <article className="rounded-2xl bg-wash px-3.5 py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text-sm font-bold text-ink-heading">
          {item.name}
        </h3>
        <span className="shrink-0 text-sm font-extrabold text-ink-heading">
          {formatBRLReais(item.amount)}
        </span>
      </div>

      <div className="mt-0.5 flex items-center gap-2">
        {date && (
          <span className="text-[11px] font-semibold text-ink-label">{date}</span>
        )}
        {item.voiceUrl && isSafeMediaUrl(item.voiceUrl) && (
          <button
            type="button"
            onClick={() => setAudioOpen((v) => !v)}
            aria-expanded={audioOpen}
            className="inline-flex items-center gap-1 rounded-full bg-card border border-line px-2 py-0.5 text-[11px] font-bold text-ink-secondary hover:text-ink-heading transition-colors duration-150 cursor-pointer outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="play" size={12} strokeWidth={2.3} />
            {audioOpen ? "Ocultar áudio" : "Ouvir áudio"}
          </button>
        )}
      </div>

      {item.message && (
        <p className="mt-1 truncate text-xs font-medium text-ink-secondary">
          {item.message}
        </p>
      )}

      {audioOpen && item.voiceUrl && isSafeMediaUrl(item.voiceUrl) && (
        <div className="mt-2 animate-fade-in">
          <AudioPlayer
            src={item.voiceUrl}
            downloadName={buildDownloadName(item)}
            getDownloadBlob={() => dashboardApi.downloadAudio(token, item.id)}
          />
        </div>
      )}
    </article>
  );
}
