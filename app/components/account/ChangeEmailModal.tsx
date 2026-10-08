import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import { OtpField } from "~/components/auth/OtpField";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { Modal } from "~/components/ui/Modal";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { useToast } from "~/contexts/useToast";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";
import {
  changeEmailSchema,
  type ChangeEmailValues,
} from "~/validators/account-validator";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail?: string;
  has2fa?: boolean;
}

export function ChangeEmailModal({
  isOpen,
  onClose,
  currentEmail,
  has2fa,
}: ChangeEmailModalProps) {
  const requestFetcher = useFetcher<{ success?: boolean; error?: string }>();
  const confirmFetcher = useFetcher<{
    success?: boolean;
    error?: string;
    message?: string;
  }>();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: "", password: "" } as ChangeEmailValues,
  });

  const totp = watch("totp");
  const requesting = requestFetcher.state === "submitting";
  const confirming = confirmFetcher.state === "submitting";
  const busy = requesting || confirming;

  useResetOnOpen(isOpen, () => {
    reset({ email: "", password: "" });
    setPending(false);
    setCode("");
    setRequestError(null);
    setConfirmError(null);
  });

  useFetcherFeedback({
    data: requestFetcher.data,
    state: requestFetcher.state,
    onResult: (result) => {
      if (result.success) {
        setRequestError(null);
        setPending(true);
      } else if (result.error) {
        setRequestError(result.error);
      }
    },
    onSubmitting: () => setRequestError(null),
  });

  useFetcherFeedback<{ success?: boolean; error?: string; message?: string }>({
    data: confirmFetcher.data,
    state: confirmFetcher.state,
    onResult: (result) => {
      if (result.success) {
        toast(result.message ?? "E-mail atualizado com sucesso.", "success");
        onClose();
      } else if (result.error) {
        setConfirmError(result.error);
      }
    },
  });

  const onRequest = (values: ChangeEmailValues) => {
    const formData = new FormData();
    formData.append("intent", "changeEmail");
    formData.append("email", values.email);
    formData.append("password", values.password);
    if (values.totp) formData.append("totp", values.totp);
    requestFetcher.submit(formData, { method: "post" });
  };

  const onConfirm = () => {
    setConfirmError(null);
    const formData = new FormData();
    formData.append("intent", "confirmEmailChange");
    formData.append("otp", code);
    confirmFetcher.submit(formData, { method: "post" });
  };

  if (pending) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Confirmar novo e-mail"
        size="sm"
      >
        <div className="space-y-4">
          {confirmError && (
            <AlertMessage variant="error" message={confirmError} />
          )}

          <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
            Etapa 2 de 2 · confirmação
          </p>
          <p className="text-[13px] font-medium leading-relaxed text-ink-secondary">
            Enviamos um código de 6 dígitos para o novo endereço. Informe o
            código para concluir a alteração.
          </p>

          <OtpField
            isOpen={isOpen}
            disabled={confirming}
            error={Boolean(confirmError)}
            onChange={setCode}
            onComplete={onConfirm}
          />

          <SubmitButton
            loading={confirming}
            disabled={confirming || code.length !== 6}
            onClick={onConfirm}
          >
            Confirmar
          </SubmitButton>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar e-mail" size="sm">
      <form onSubmit={handleSubmit(onRequest)} className="space-y-3.5">
        {requestError && (
          <AlertMessage variant="error" message={requestError} />
        )}

        <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
          Etapa 1 de 2 · provas
        </p>
        {currentEmail && (
          <div className="rounded-2xl bg-wash px-4 py-3">
            <span className={`block ${SECTION_HEADING_CLASS}`}>
              E-mail atual
            </span>
            <p className="mt-0.5 text-[13px] font-semibold text-ink-body">
              {currentEmail}
            </p>
          </div>
        )}

        <FormField
          label="Novo e-mail"
          icon="mention-circle"
          type="email"
          placeholder="exemplo@email.com"
          autoComplete="email"
          error={errors.email?.message}
          disabled={busy}
          {...register("email")}
        />

        <PasswordField
          label="Senha"
          icon="lock"
          autoComplete="current-password"
          error={errors.password?.message}
          disabled={busy}
          {...register("password")}
        />

        {has2fa && (
          <OtpField
            label="Código atual do app (6 dígitos)"
            isOpen={isOpen}
            disabled={busy}
            error={Boolean(requestError) && !totp}
            onChange={(value) => setValue("totp", value)}
          />
        )}

        <p className="text-xs font-medium leading-relaxed text-ink-muted">
          Enviaremos um código de verificação para o novo endereço e todas as
          outras sessões serão encerradas.
        </p>

        <SubmitButton
          loading={busy}
          disabled={busy || (has2fa && totp?.length !== 6)}
        >
          Atualizar e-mail
        </SubmitButton>
      </form>
    </Modal>
  );
}
