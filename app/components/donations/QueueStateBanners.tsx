import { Link } from "react-router";
import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";

interface QueueStateBannersProps {
  isOverlayOnline: boolean;
  isPaused: boolean;
  pendingCount: number;
  onResume?: () => void;
  resumeLoading?: boolean;
}

export function QueueStateBanners({
  isOverlayOnline,
  isPaused,
  pendingCount,
  onResume,
  resumeLoading,
}: QueueStateBannersProps) {
  if (!isOverlayOnline) {
    return (
      <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="mt-0.5 w-8 h-8 rounded-full bg-error/20 flex items-center justify-center shrink-0">
            <Icon name="danger-circle" size={16} strokeWidth={2} className="text-error" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink-heading leading-snug">
              Overlay desconectado
            </p>
            <p className="text-xs font-medium text-ink-secondary mt-0.5 leading-snug">
              Novas doações aparecem como "Não exibido" no histórico, mas não entram na fila. Reconecte o overlay no OBS ou use Replay manualmente.
            </p>
          </div>
        </div>
        <Link
          to="/widgets?widget=overlay"
          className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-full bg-wash text-ink-body hover:bg-wash-hover text-xs font-bold transition-colors"
        >
          <Icon name="widget" size={16} strokeWidth={2} />
          Ver como conectar
        </Link>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="mt-0.5 w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
            <Icon name="pause" size={16} strokeWidth={2} className="text-yellow-ink" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink-heading leading-snug">
              Fila pausada
            </p>
            <p className="text-xs font-medium text-ink-secondary mt-0.5 leading-snug">
              {pendingCount > 0
                ? `${pendingCount} ${pendingCount === 1 ? "doação" : "doações"} aguardando — tocarão ao retomar em ordem.`
                : "Nenhuma doação aguardando — novas ficarão na fila até retomar."}
            </p>
          </div>
        </div>
        {onResume && (
          <Button
            variant="primary"
            size="sm"
            onClick={onResume}
            loading={resumeLoading}
            className="shrink-0"
          >
            <Icon name="play" size={16} strokeWidth={2} />
            Retomar Fila
          </Button>
        )}
      </div>
    );
  }

  return null;
}
