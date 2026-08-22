import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { forgotPasswordSchema } from "~/validators/auth-validator";
import type { Route } from "./+types/forgot-password";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Forgot Password — LinkPix" }];
}

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setApiError(null);
    const result = await authApi.forgotPassword({ email: data.email });

    if (!result.success) {
      setApiError(result.error.message);
      return;
    }

    setSubmittedEmail(data.email);
    setSuccess(true);
  };

  return (
    <AuthCard
      title="Esqueci minha senha"
      subtitle="Enviaremos um link para definir a nova senha"
    >
      {success ? (
        <div className="space-y-6">
          <AlertMessage
            variant="success"
            message={`Verifique seu email (${submittedEmail}) para o link de redefinição.`}
          />
          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-[13px] font-semibold text-info hover:text-blue-700 underline transition-colors duration-150"
            >
              Voltar para Login
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

          <FormField
            label="E-mail"
            {...register("email")}
            type="email"
            error={errors.email?.message}
            icon="letter"
            placeholder="email@email.com"
            disabled={isSubmitting}
            autoFocus
          />

          <div className="mt-6">
            <SubmitButton loading={isSubmitting}>Enviar</SubmitButton>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/auth/login"
              className="text-[13px] font-semibold text-info hover:text-blue-700 transition-colors duration-150"
            >
              Voltar para Login
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
