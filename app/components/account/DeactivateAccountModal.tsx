import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Form, useNavigation, useSubmit } from "react-router";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Modal } from "~/components/ui/Modal";
import { z } from "zod";

export const deactivateAccountSchema = z.object({
  password: z.string().min(1, "Confirme com sua senha"),
});

type DeactivateAccountValues = z.infer<typeof deactivateAccountSchema>;

interface DeactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Error surfaced by the route action when the deactivation fails. */
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

  useEffect(() => {
    if (isOpen) {
      reset({ password: "" });
    }
  }, [isOpen, reset]);

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

        <div className="flex flex-col gap-1.5 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-full bg-error text-white text-[11px] font-bold hover:bg-error-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Desativando..." : "Desativar conta"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-full bg-wash text-[11px] font-bold text-ink-body hover:bg-wash-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60"
          >
            Não, manter minha conta
          </button>
        </div>
      </Form>
    </Modal>
  );
}
