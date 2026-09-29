import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { resetPasswordSchema } from "~/validators/auth-validator";
import { getPasswordStrength } from "~/validators/password";
import { LINK_CLASS } from "~/components/ui/classes";
import type { Route } from "./+types/reset-password";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Redefinir senha — LinkPix" }];
}

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setApiError("Link inválido ou ausente.");
      return;
    }

    setApiError(null);
    const result = await authApi.resetPassword({
      token,
      newPassword: data.newPassword,
    });

    if (!result.success) {
      setApiError(result.error.message);
      return;
    }

    setSuccess(true);
  };

  if (!token) {
    return (
      <AuthCard
        title="Link inválido"
        subtitle="Este link de redefinição é inválido ou está ausente."
      >
        <div className="space-y-6">
          <AlertMessage variant="error" message="Token de redefinição ausente." />
          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className={`text-[13px] font-semibold ${LINK_CLASS} transition-colors duration-150`}
            >
              Solicitar novo link
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Definir nova senha" subtitle="Escolha uma senha forte">
      {success ? (
        <div className="space-y-6">
          <AlertMessage
            variant="success"
            message="Sua senha foi alterada com sucesso."
          />
          <div className="text-center mt-6">
            <Link to="/auth/login" className="inline-block w-full">
              <Button variant="primary" className="w-full">
                Ir para o login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          onChange={() => setApiError(null)}
          className="space-y-4"
        >
          {apiError && <AlertMessage variant="error" message={apiError} />}

          <PasswordField
            label="Nova senha"
            {...register("newPassword")}
            error={errors.newPassword?.message}
            icon="lock"
            placeholder="Crie uma senha forte"
            disabled={isSubmitting}
            showStrength
            strengthScore={getPasswordStrength(newPasswordValue || "")}
            autoFocus
          />

          <PasswordField
            label="Confirmar senha"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            icon="lock"
            placeholder="Confirme sua senha"
            disabled={isSubmitting}
          />

          <div className="mt-6">
            <SubmitButton loading={isSubmitting}>Redefinir senha</SubmitButton>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
