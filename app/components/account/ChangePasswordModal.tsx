import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Modal } from "~/components/ui/Modal";
import { PasswordField } from "~/components/auth/PasswordField";
import { OtpField } from "~/components/auth/OtpField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useToast } from "~/components/ui/useToast";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "~/validators/account-validator";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Com 2FA ativo o backend exige a senha atual + TOTP. */
  has2fa?: boolean;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  has2fa,
}: ChangePasswordModalProps) {
  const fetcher = useFetcher();
  const loading = fetcher.state === "submitting";
  const { toast } = useToast();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } as ChangePasswordValues,
  });

  const totp = watch("totp");

  useResetOnOpen(isOpen, () => {
    reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setLocalError(null);
  });

  useFetcherFeedback({
    data: fetcher.data,
    state: fetcher.state,
    onResult: (result: any) => {
      if (result.success) {
        toast(result.message ?? "Senha alterada com sucesso.", "success");
        onClose();
      } else if (result.error) {
        setLocalError(result.error);
      }
    },
    onSubmitting: () => setLocalError(null),
  });

  const onSubmit = (values: ChangePasswordValues) => {
    const formData = new FormData();
    formData.append("intent", "changePassword");
    formData.append("currentPassword", values.currentPassword);
    formData.append("newPassword", values.newPassword);
    if (values.totp) formData.append("totp", values.totp);
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar senha" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {localError && <AlertMessage variant="error" message={localError} />}

        <PasswordField
          label="Senha atual"
          icon="lock"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          disabled={loading}
          {...register("currentPassword")}
        />

        <PasswordField
          label="Nova senha"
          icon="key-minimalistic-square"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          disabled={loading}
          {...register("newPassword")}
        />

        <PasswordField
          label="Confirmar nova senha"
          icon="key-minimalistic-square"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          disabled={loading}
          {...register("confirmPassword")}
        />

        {has2fa && (
          <OtpField
            label="Código do autenticador"
            isOpen={isOpen}
            disabled={loading}
            error={Boolean(localError) && !totp}
            onChange={(code) => setValue("totp", code, { shouldValidate: false })}
          />
        )}

        <SubmitButton
          loading={loading}
          disabled={loading || (has2fa && totp?.length !== 6)}
          className="mt-1"
        >
          Salvar
        </SubmitButton>
      </form>
    </Modal>
  );
}
