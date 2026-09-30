import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";
import { useForm } from "react-hook-form";
import { Form, useNavigation, useSubmit } from "react-router";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { ConfirmButtons } from "~/components/ui/ConfirmButtons";
import { Modal } from "~/components/ui/Modal";
import {
  deactivateAccountSchema,
  type DeactivateAccountValues,
} from "~/validators/account-validator";

interface DeactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionError?: string | null;
}

export function DeactivateAccountModal({
  isOpen,
  onClose,
  actionError,
}: DeactivateAccountModalProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const loading =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "deactivate";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deactivateAccountSchema),
    defaultValues: { password: "" } as DeactivateAccountValues,
  });

  useResetOnOpen(isOpen, () => {
    reset({ password: "" });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Desativar conta"
      size="sm"
    >
      <Form
        ref={formRef}
        method="post"
        onSubmit={handleSubmit(() => {
          if (formRef.current) submit(formRef.current, { method: "post" });
        })}
        className="space-y-4"
      >
        <input type="hidden" name="intent" value="deactivate" />

        {actionError && <AlertMessage variant="error" message={actionError} />}

        <p className="text-[13px] font-medium leading-relaxed text-ink-secondary">
          Sua conta será desativada e todas as sessões serão encerradas. Você
          pode reativá-la fazendo login novamente.
        </p>

        <PasswordField
          label="Senha"
          icon="lock"
          autoComplete="current-password"
          error={errors.password?.message}
          disabled={loading}
          {...register("password")}
        />

        <div className="pt-1">
          <ConfirmButtons
            confirmLabel="Desativar conta"
            loadingLabel="Desativando..."
            cancelLabel="Não, manter minha conta"
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </Form>
    </Modal>
  );
}
