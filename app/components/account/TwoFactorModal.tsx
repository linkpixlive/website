import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { OtpField } from "~/components/auth/OtpField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Icon } from "~/components/ui/Icon";
import { Modal } from "~/components/ui/Modal";
import { PasswordField } from "~/components/auth/PasswordField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { CopyButton } from "~/components/ui/CopyButton";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";
import { useTwoFactorSetup } from "./useTwoFactorSetup";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabled: boolean;
}

interface SetupPayload {
  otpauthUrl: string;
  secret: string;
}

function TwoFactorDisableForm({
  isOpen,
  loading,
  error,
  onTokenChange,
  onDisable,
}: {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  onTokenChange: (token: string) => void;
  onDisable: (password: string) => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget);
        onDisable(String(value.get("password") ?? ""));
      }}
      className="space-y-4"
    >
      {error && <AlertMessage variant="error" message={error} />}
      <p className="text-[13px] font-medium text-ink-secondary leading-relaxed">
        Confirme sua senha e o código do app autenticador para desativar a
        proteção extra no login.
      </p>
      <PasswordField
        label="Senha"
        icon="lock"
        name="password"
        autoComplete="current-password"
        disabled={loading}
      />
      <OtpField
        label="Digite o código de 6 dígitos do app para confirmar."
        isOpen={isOpen}
        onComplete={onTokenChange}
        disabled={loading}
        error={Boolean(error)}
      />
      <SubmitButton loading={loading} disabled={loading}>
        Desativar 2FA
      </SubmitButton>
    </form>
  );
}

function TwoFactorSetupView({
  isOpen,
  loading,
  error,
  setupPayload,
  setupError,
  onCodeComplete,
  onStartSetup,
}: {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  setupPayload: SetupPayload | undefined;
  setupError: string | null;
  onCodeComplete: (code: string) => void;
  onStartSetup: (password: string) => void;
}) {
  const [password, setPassword] = useState("");

  useResetOnOpen(isOpen, () => setPassword(""));

  if (setupPayload) {
    return (
      <div className="space-y-4">
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
          <span className={SECTION_HEADING_CLASS}>Chave manual</span>
          <div className="flex items-center gap-2 rounded-xl bg-wash border border-line px-3 py-2">
            <code className="flex-1 min-w-0 text-xs font-mono font-semibold text-ink-body break-all">
              {setupPayload.secret}
            </code>
            <CopyButton
              variant="inline"
              text={setupPayload.secret}
              label="Copiar chave"
              copiedChildren={
                <Icon
                  name="check-circle"
                  size={16}
                  strokeWidth={2}
                  className="text-success"
                />
              }
            >
              <Icon name="copy" size={16} strokeWidth={1.9} />
            </CopyButton>
          </div>
        </div>

        <OtpField
          label="Digite o código de 6 dígitos do app para confirmar."
          isOpen={isOpen}
          onComplete={onCodeComplete}
          disabled={loading}
          error={Boolean(error)}
        />
      </div>
    );
  }

  // Sem segredo gerado ainda (primeira vez ou retry): a senha é o que libera o setup.
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onStartSetup(password);
      }}
      className="space-y-4"
    >
      {setupError && <AlertMessage variant="error" message={setupError} />}

      <p className="text-[13px] font-medium text-ink-secondary leading-relaxed">
        Confirme sua senha para gerar o código de configuração do app
        autenticador.
      </p>

      <PasswordField
        label="Senha"
        icon="lock"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={loading}
      />

      <SubmitButton loading={loading} disabled={loading || !password}>
        Gerar código
      </SubmitButton>
    </form>
  );
}

export function TwoFactorModal({ isOpen, onClose, enabled }: TwoFactorModalProps) {
  const {
    loading,
    error,
    setupPayload,
    setupError,
    onTokenChange,
    handleCodeComplete,
    handleDisable,
    handleStartSetup,
  } = useTwoFactorSetup({ isOpen, enabled, onClose });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Autenticação em dois fatores"
      size="sm"
    >
      {enabled ? (
        <TwoFactorDisableForm
          isOpen={isOpen}
          loading={loading}
          error={error}
          onTokenChange={onTokenChange}
          onDisable={handleDisable}
        />
      ) : (
        <TwoFactorSetupView
          isOpen={isOpen}
          loading={loading}
          error={error}
          setupPayload={setupPayload}
          setupError={setupError}
          onCodeComplete={handleCodeComplete}
          onStartSetup={handleStartSetup}
        />
      )}
    </Modal>
  );
}
