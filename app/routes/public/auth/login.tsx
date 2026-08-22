import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, redirect, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { AuthDivider } from "~/components/auth/AuthDivider";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { createAuthCookie } from "~/util/session.server";
import { loginSchema } from "~/validators/auth-validator";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign In — LinkPix" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await authApi.login({ email, password });

  if (!result.success) {
    const msg = result.error.message;
    if (msg.toLowerCase().includes("not verified")) {
      return redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    }
    return { error: msg };
  }

  return redirect("/", {
    headers: { "Set-Cookie": createAuthCookie(result.data) },
  });
}

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (actionData?.error) {
      setApiError(actionData.error);
    }
  }, [actionData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    submit(formData, { method: "post" });
  };

  return (
    <AuthCard title="Bem-vindo de volta!" subtitle="Entre em sua conta">
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
          disabled={loading}
          autoFocus
        />

        <div className="space-y-1">
          <PasswordField
            label="Senha"
            {...register("password")}
            error={errors.password?.message}
            icon="lock"
            placeholder="Digite sua senha"
            disabled={loading}
          />
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-[13px] font-semibold text-info hover:text-blue-700 transition-colors duration-150"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <SubmitButton loading={loading}>Entrar</SubmitButton>
        </div>

        <AuthDivider text="ou" />

        <p className="mt-4 text-center text-sm font-medium text-ink-secondary">
          Não tem uma conta?{" "}
          <Link
            to="/auth/register"
            className="text-info hover:text-blue-700 font-semibold underline transition-colors duration-150"
          >
            Crie aqui
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
