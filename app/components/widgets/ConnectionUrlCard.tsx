import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { EyeToggleButton } from "~/components/ui/EyeToggleButton";
import { Icon } from "~/components/ui/Icon";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { CopyButton } from "~/components/ui/CopyButton";
import type { Widget } from "~/api/modules/widgets";

export function ConnectionUrlCard({
  widget,
  loading,
  onResetToken,
  onTestAlert,
}: {
  widget: Widget;
  loading: boolean;
  onResetToken: () => void;
  onTestAlert: () => void;
}) {
  const [showUrl, setShowUrl] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState(`/overlay?token=${widget.token}`);

  useEffect(() => {
    setWidgetUrl(`${window.location.origin}/overlay?token=${widget.token}`);
  }, [widget.token]);

  return (
    <div className={CARD_CLASS}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <span className={SECTION_HEADING_CLASS}>URL de conexão</span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onResetToken}
          disabled={loading}
        >
          <Icon name="refresh" size={14} strokeWidth={2} />
          Resetar Token
        </Button>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 bg-card border border-line-input rounded-full px-4 py-2.5 flex items-center min-w-0">
          <span
            className={`text-[13px] font-mono font-medium flex-1 truncate ${
              !showUrl ? "blur-md select-none pointer-events-none text-ink-body" : "text-ink-heading select-all"
            }`}
          >
            {widgetUrl}
          </span>
        </div>
        <EyeToggleButton
          visible={showUrl}
          onToggle={() => setShowUrl((v) => !v)}
          size="lg"
          showLabel="Mostrar URL"
          hideLabel="Ocultar URL"
        />
        <CopyButton
          variant="icon"
          text={widgetUrl}
          label="Copiar URL"
          copiedLabel="Copiado!"
          onStatusChange={setUrlCopied}
          copiedChildren={
            <Icon
              name="check-circle"
              size={18}
              strokeWidth={2}
              className="mx-auto animate-fade-in"
            />
          }
        >
          <Icon
            name="copy"
            size={18}
            strokeWidth={2}
            className="mx-auto animate-fade-in"
          />
        </CopyButton>
      </div>

      <p
        className={`mt-2 text-xs font-semibold ${
          urlCopied ? "text-success" : "invisible"
        }`}
        aria-live="polite"
      >
        Copiado!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={onTestAlert}
          disabled={loading}
        >
          <Icon name="test-tube" size={16} strokeWidth={2} />
          Enviar Alerta de Teste
        </Button>
      </div>
    </div>
  );
}
