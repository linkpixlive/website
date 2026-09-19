import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";

interface QueueToolbarProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onSkip: () => void;
  onClear: () => void;
  onTest: () => void;
  onOpenPopup?: () => void;
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
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={onTogglePause}
        loading={loading.togglePause}
      >
        <Icon name={isPaused ? "play" : "pause"} size={16} strokeWidth={2} />
        {isPaused ? "Retomar Fila" : "Pausar Fila"}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onSkip}
        loading={loading.skip}
      >
        <Icon name="skip-next" size={16} strokeWidth={2} />
        Pular Alerta
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onTest}
        loading={loading.test}
      >
        <Icon name="test-tube" size={16} strokeWidth={2} />
        Testar Alerta
      </Button>

      <Button
        variant="danger-soft"
        size="sm"
        onClick={onClear}
        loading={loading.clear}
      >
        <Icon name="trash-bin-minimalistic" size={16} strokeWidth={2} />
        Limpar Fila
      </Button>

      {onOpenPopup && (
        <Button variant="inverse" size="sm" onClick={onOpenPopup} className="ml-auto">
          <Icon name="square-arrow-right-up" size={16} strokeWidth={2} />
          Abrir em Popup
        </Button>
      )}
    </div>
  );
}
