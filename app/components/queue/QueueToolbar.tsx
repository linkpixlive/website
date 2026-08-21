import { ExternalLink, Pause, Play, SkipForward, Trash2, TestTube } from "lucide-react";
import { Button } from "~/components/ui/Button";

interface QueueToolbarProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onSkip: () => void;
  onClear: () => void;
  onTest: () => void;
  onOpenPopup: () => void;
  loading?: {
    togglePause?: boolean;
    skip?: boolean;
    clear?: boolean;
    test?: boolean;
  };
}

export function QueueToolbar({
  isPaused,
  onTogglePause,
  onSkip,
  onClear,
  onTest,
  onOpenPopup,
  loading = {},
}: QueueToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="primary"
        size="sm"
        onClick={onTogglePause}
        loading={loading.togglePause}
      >
        {isPaused ? (
          <>
            <Play className="h-4 w-4" />
            Retomar Fila
          </>
        ) : (
          <>
            <Pause className="h-4 w-4" />
            Pausar Fila
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onSkip}
        loading={loading.skip}
      >
        <SkipForward className="h-4 w-4" />
        Pular Alerta
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        loading={loading.clear}
      >
        <Trash2 className="h-4 w-4" />
        Limpar Fila
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onTest}
        loading={loading.test}
      >
        <TestTube className="h-4 w-4" />
        Testar Alerta
      </Button>

      <div className="ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenPopup}
        >
          <ExternalLink className="h-4 w-4" />
          Abrir em Popup
        </Button>
      </div>
    </div>
  );
}
