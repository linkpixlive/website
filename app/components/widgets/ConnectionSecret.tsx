import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { EyeToggleButton } from "~/components/ui/EyeToggleButton";
import { Icon } from "~/components/ui/Icon";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { CopyButton } from "~/components/ui/CopyButton";
import type { Widget } from "~/api/modules/widgets";

export function ConnectionSecret({
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
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState(`/overlay?token=${widget.token}`);

  useEffect(() => {
    setWidgetUrl(`${window.location.origin}/overlay?token=${widget.token}`);
  }, [widget.token]);

  return (
    <section aria-labelledby="widgets-connection-heading">
      <p className={SECTION_HEADING_CLASS}>01 · Conexão</p>
      <h2
        id="widgets-connection-heading"
        className="mt-1.5 text-lg font-extrabold tracking-tight text-ink-heading"
      >
        Sua URL secreta do overlay
      </h2>
      <p className="mt-1 text-sm font-medium text-ink-secondary">
        Cole no OBS como fonte de navegador.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <div className="min-w-0 flex-1 rounded-2xl border border-line-input bg-card px-4 py-3">
          <span
            className={`block truncate font-mono text-[13px] font-medium ${
              showUrl
                ? "text-ink-heading select-all"
                : "text-ink-body blur-[3px] select-none"
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
        aria-live="polite"
        className={`mt-1.5 text-xs font-bold ${
          urlCopied ? "text-success" : "invisible"
        }`}
      >
        Copiado!
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onTestAlert}
          disabled={loading}
        >
          <Icon name="test-tube" size={16} strokeWidth={2} />
          Enviar alerta de teste
        </Button>
        {confirmingReset ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={onResetToken}
              loading={loading}
            >
              Gerar nova URL
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setConfirmingReset(false)}
              disabled={loading}
            >
              Manter atual
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            disabled={loading}
            className="text-[13px] font-semibold text-error outline-none hover:underline hover:underline-offset-2 disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            Resetar token
          </button>
        )}
      </div>

      {confirmingReset && (
        <p className="mt-2 text-[13px] font-semibold text-ink-body">
          A URL atual{" "}
          <span className="text-error">deixará de funcionar</span> no OBS.
          Só confirme se consegue colar a nova URL na cena.
        </p>
      )}
      <p className="mt-1.5 text-xs font-medium text-ink-muted">
        Se o alerta chegar no OBS, a conexão está certa de ponta a ponta.
      </p>
    </section>
  );
}
