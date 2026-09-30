import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useActionData, useNavigation, useSearchParams, useSubmit } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useActionError } from "~/hooks/useActionError";
import { resetPasswordSchema } from "~/validators/auth-validator";
import { getPasswordStrength } from "~/validators/password";
import { LINK_CLASS } from "~/components/ui/classes";
import type { Route } from "./+types/reset-password";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Redefinir senha — LinkPix" }];
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return { error: "Link inválido ou ausente." };
  }

  const formData = await request.formData();
  const parsed = resetPasswordSchema.safeParse({
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await authApi.resetPassword({
    token,
    newPassword: parsed.data.newPassword,
  });
  if (!result.success) {
    return { error: result.error.message };
  }

  return { success: true };
}

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const [apiError, clearApiError] = useActionError(actionData);
  const success = actionData?.success === true;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = (data: ResetPasswordFormValues) => {
    clearApiError();
    const formData = new FormData();
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);
    submit(formData, { method: "post" });
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
          onChange={clearApiError}
          className="space-y-4"
        >
          {apiError && <AlertMessage variant="error" message={apiError} />}

          <PasswordField
            label="Nova senha"
            {...register("newPassword")}
            error={errors.newPassword?.message}
            icon="lock"
            placeholder="Crie uma senha forte"
            disabled={loading}
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
            disabled={loading}
          />

          <div className="mt-6">
            <SubmitButton loading={loading}>Redefinir senha</SubmitButton>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
