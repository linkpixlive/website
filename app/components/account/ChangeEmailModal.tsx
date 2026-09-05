import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Form, useNavigation, useSubmit } from "react-router";
import { PasswordField } from "~/components/auth/PasswordField";
import { FormField } from "~/components/ui/FormField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Modal } from "~/components/ui/Modal";
import { SubmitButton } from "~/components/ui/SubmitButton";
import {
  changeEmailSchema,
  type ChangeEmailValues,
} from "~/validators/account-validator";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail?: string;
  /** Error surfaced by the route action when the change fails. */
  actionError?: string | null;
}

export function ChangeEmailModal({
  isOpen,
  onClose,
  currentEmail,
  actionError,
}: ChangeEmailModalProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const loading =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "changeEmail";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: "",
      password: "",
    } as ChangeEmailValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset({ email: "", password: "" });
    }
  }, [isOpen, reset]);

  // Success is handled by the route action, which redirects the whole
  // document to the verify-email flow for the new address.

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar e-mail" size="sm">
      <Form
        ref={formRef}
        method="post"
        onSubmit={handleSubmit(() => {
          // Validated client-side; now hand the form to React Router so the
          // action's redirect (with its Set-Cookie header) applies document-wide.
          if (formRef.current) submit(formRef.current, { method: "post" });
        })}
        className="space-y-3.5"
      >
        <input type="hidden" name="intent" value="changeEmail" />

        {actionError && <AlertMessage variant="error" message={actionError} />}

        {currentEmail && (
          <div className="rounded-2xl bg-wash px-4 py-3">
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
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
          disabled={loading}
          {...register("email")}
        />

        <PasswordField
          label="Senha"
          icon="lock"
          autoComplete="current-password"
          error={errors.password?.message}
          disabled={loading}
          {...register("password")}
        />

        <p className="text-xs font-medium leading-relaxed text-ink-muted">
          Enviaremos um código de verificação para o novo endereço e todas as
          sessões serão encerradas.
        </p>

        <SubmitButton loading={loading} disabled={loading}>
          Atualizar e-mail
        </SubmitButton>
      </Form>
    </Modal>
  );
}
