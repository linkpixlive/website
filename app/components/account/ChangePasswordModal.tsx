import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Modal } from "~/components/ui/Modal";
import { PasswordField } from "~/components/auth/PasswordField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useToast } from "~/components/ui/useToast";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "~/validators/account-validator";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const fetcher = useFetcher();
  const loading = fetcher.state === "submitting";
  const { toast } = useToast();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } as ChangePasswordValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLocalError(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.success) {
      toast(fetcher.data.message ?? "Senha alterada com sucesso.", "success");
      onClose();
    } else if (fetcher.data.error) {
      setLocalError(fetcher.data.error);
    }
  }, [fetcher.data, toast, onClose]);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      setLocalError(null);
    }
  }, [fetcher.state]);

  const onSubmit = (values: ChangePasswordValues) => {
    const formData = new FormData();
    formData.append("intent", "changePassword");
    formData.append("currentPassword", values.currentPassword);
    formData.append("newPassword", values.newPassword);
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

        <SubmitButton loading={loading} disabled={loading} className="mt-1">
          Salvar
        </SubmitButton>
      </form>
    </Modal>
  );
}
