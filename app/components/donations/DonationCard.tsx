import type { DonationHistory } from "~/api/modules/dashboard";
import { dashboardApi } from "~/api/modules/dashboard";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { Badge } from "~/components/ui/Badge";
import { AudioPlayer } from "~/components/ui/AudioPlayer";

interface DonationCardProps {
  item: DonationHistory;
  isCurrent?: boolean;
  onReplay?: (id: string) => void;
  replayLoading?: boolean;
  token?: string | null;
}

function formatCurrency(value: unknown) {
  const num =
    typeof value === "object" && value !== null && "toString" in value
      ? Number(String((value as any).toString()))
      : Number(value as any);
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapStatus(status: string): { badge: string; label: string } {
  if (status === "paid") return { badge: "pending", label: "Não exibido" };
  if (status === "displayed") return { badge: "success", label: "Exibido" };
  return { badge: status, label: status };
}

function buildDownloadName(item: DonationHistory) {
  const slug =
    item.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "doacao";
  const stamp = item.approvedAt ? new Date(item.approvedAt).getTime() : item.id;
  const ext =
    item.voiceUrl?.toLowerCase().endsWith(".mp3") ? "mp3" : "wav";
  return `doacao-${slug}-${stamp}.${ext}`;
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
          {formatCurrency(item.amount)}
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {item.approvedAt && (
          <span className="text-[11px] font-semibold text-ink-label">
            {formatDate(item.approvedAt)}
          </span>
        )}
        {isCurrent ? (
          <span
            className="inline-flex items-center whitespace-nowrap rounded-full bg-yellow-wash text-yellow-ink border border-yellow-wash dark:bg-warning/15 dark:text-warning dark:border-warning/20 text-xs font-extrabold uppercase tracking-wider px-2.5 py-1"
            title={mapped.label}
          >
            Exibindo agora
          </span>
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
          {item.voiceUrl && (
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onReplay(item.id)}
                loading={replayLoading}
                className="border border-line"
              >
                <Icon name="repeat-one" size={16} strokeWidth={2} />
                Repetir
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
