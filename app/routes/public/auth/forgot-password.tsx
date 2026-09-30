import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { LINK_CLASS } from "~/components/ui/classes";
import { FormField } from "~/components/ui/FormField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useActionError } from "~/hooks/useActionError";
import { forgotPasswordSchema } from "~/validators/auth-validator";
import type { Route } from "./+types/forgot-password";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Esqueci minha senha — LinkPix" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parsed = forgotPasswordSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await authApi.forgotPassword({ email: parsed.data.email });
  if (!result.success) {
    return { error: result.error.message };
  }

  return { success: true, email: parsed.data.email };
}

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const [apiError, clearApiError] = useActionError(actionData);

  const success = actionData?.success === true;
  const submittedEmail = success ? (actionData.email as string) : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    clearApiError();
    const formData = new FormData();
    formData.append("email", data.email);
    submit(formData, { method: "post" });
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
              className={`text-[13px] font-semibold ${LINK_CLASS} transition-colors duration-150`}
            >
              Voltar para Login
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          onChange={clearApiError}
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
            disabled={loading}
            autoFocus
          />

          <div className="mt-6">
            <SubmitButton loading={loading}>Enviar</SubmitButton>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/auth/login"
              className="text-[13px] font-semibold text-info hover:text-info-hover transition-colors duration-150"
            >
              Voltar para Login
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
