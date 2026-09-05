import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { OtpInput } from "~/components/auth/OtpInput";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { Modal } from "~/components/ui/Modal";
import { PasswordField } from "~/components/auth/PasswordField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useToast } from "~/components/ui/useToast";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabled: boolean;
}

interface SetupPayload {
  otpauthUrl: string;
  secret: string;
}

type FetcherData =
  | { success: true; action: string; message?: string; data?: SetupPayload }
  | { success: false; action: string; error: string }
  | null;

function isAction(
  data: FetcherData,
  action: string,
): data is Extract<NonNullable<FetcherData>, { action: string }> {
  return Boolean(data && data.action === action);
}

export function TwoFactorModal({ isOpen, onClose, enabled }: TwoFactorModalProps) {
  const fetcher = useFetcher();
  const loading = fetcher.state === "submitting";
  const { toast } = useToast();
  const [localError, setLocalError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = fetcher.data as FetcherData;

  const setupSucceeded = isAction(data, "2faSetup") && data.success;
  const setupPayload = setupSucceeded ? (data as { data?: SetupPayload }).data : undefined;
  const setupError =
    isAction(data, "2faSetup") && !data.success ? data.error : null;
  const submitError =
    (isAction(data, "2faEnable") || isAction(data, "2faDisable")) &&
    !data.success
      ? data.error
      : null;

  useEffect(() => {
    if (!isOpen || enabled) return;
    if (fetcher.state !== "idle") return;
    if (setupPayload || setupError) return;

    const formData = new FormData();
    formData.append("intent", "2faSetup");
    fetcher.submit(formData, { method: "post" });
    // Auto-starts the TOTP setup once per modal opening.
  }, [isOpen, enabled, fetcher, setupPayload, setupError]);

  useEffect(() => {
    if (
      (isAction(data, "2faEnable") || isAction(data, "2faDisable")) &&
      data.success
    ) {
      toast(data.message ?? "Autenticação em dois fatores atualizada.", "success");
      onClose();
    }
  }, [data, toast, onClose]);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      setLocalError(null);
    }
  }, [fetcher.state]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const submitIntent = (intent: string, values: Record<string, string>) => {
    const formData = new FormData();
    formData.append("intent", intent);
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value);
    }
    fetcher.submit(formData, { method: "post" });
  };

  const handleCodeComplete = (code: string) => {
    if (loading) return;
    setLocalError(null);
    submitIntent("2faEnable", { token: code });
  };

  const handleDisable = (values: { password: string }) => {
    if (loading) return;
    setLocalError(null);
    submitIntent("2faDisable", values);
  };

  const handleCopySecret = async () => {
    if (!setupPayload?.secret) return;
    try {
      await navigator.clipboard.writeText(setupPayload.secret);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions/jsdom): secret stays visible.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Autenticação em dois fatores"
      size="sm"
    >
      {enabled ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget);
            handleDisable({ password: String(value.get("password") ?? "") });
          }}
          className="space-y-4"
        >
          {(localError || submitError) && (
            <AlertMessage
              variant="error"
              message={localError ?? submitError ?? ""}
            />
          )}
          <p className="text-[13px] font-medium text-ink-secondary leading-relaxed">
            Confirme sua senha para desativar a proteção extra no login.
          </p>
          <PasswordField
            label="Senha"
            icon="lock"
            name="password"
            autoComplete="current-password"
            disabled={loading}
          />
          <SubmitButton loading={loading} disabled={loading}>
            Desativar 2FA
          </SubmitButton>
        </form>
      ) : (
        <div className="space-y-4">
          {(localError || submitError) && (
            <AlertMessage
              variant="error"
              message={localError ?? submitError ?? ""}
            />
          )}

          {loading && !setupPayload && (
            <div className="py-8 text-center">
              <p className="text-[13px] font-medium text-ink-secondary">
                Gerando seu código...
              </p>
            </div>
          )}

          {!loading && setupError && !setupPayload && (
            <div className="space-y-3">
              <AlertMessage variant="error" message={setupError} />
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => submitIntent("2faSetup", {})}
                >
                  <Icon name="refresh" size={16} strokeWidth={1.9} />
                  Gerar novo código
                </Button>
              </div>
            </div>
          )}

          {setupPayload && (
            <>
              <p className="text-[13px] font-medium text-ink-secondary leading-relaxed">
                Aponte a câmera do seu app autenticador para o código abaixo.
              </p>

              <div className="rounded-2xl bg-wash border border-line p-5 grid place-items-center">
                <QRCodeSVG
                  value={setupPayload.otpauthUrl}
                  size={168}
                  bgColor="#ffffff"
                  fgColor="#11151e"
                  level="M"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
                  Chave manual
                </span>
                <div className="flex items-center gap-2 rounded-xl bg-wash border border-line px-3 py-2">
                  <code className="flex-1 min-w-0 text-xs font-mono font-semibold text-ink-body break-all">
                    {setupPayload.secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="shrink-0 p-1 rounded-full text-chrome-icon hover:bg-wash transition-colors duration-150 outline-none cursor-pointer active:scale-95"
                    aria-label="Copiar chave"
                  >
                    <Icon
                      name={copied ? "check-circle" : "copy"}
                      size={16}
                      strokeWidth={copied ? 2 : 1.9}
                      className={copied ? "text-success" : undefined}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[13px] font-medium text-ink-secondary">
                  Digite o código de 6 dígitos do app para confirmar.
                </span>
                <OtpInput
                  onComplete={handleCodeComplete}
                  disabled={loading}
                  error={Boolean(submitError)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
