import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, redirect, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import {
  authApi,
  type Login2faPayload,
} from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { AuthDivider } from "~/components/auth/AuthDivider";
import { OtpInput } from "~/components/auth/OtpInput";
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
  const intent = formData.get("intent");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (intent === "totp") {
    const totp = formData.get("totp") as string;
    const nonce = formData.get("nonce") as string;
    return handleLogin2fa({ email, password, totp, nonce });
  }

  const result = await authApi.login({ email, password });

  if (!result.success) {
    const msg = result.error.message;
    if (msg.toLowerCase().includes("not verified")) {
      return redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    }
    return { error: msg };
  }

  if (typeof result.data === "object" && result.data !== null) {
    return { requires2fa: true, nonce: result.data.nonce };
  }

  return redirect("/", {
    headers: { "Set-Cookie": createAuthCookie(result.data) },
  });
}

async function handleLogin2fa(body: Login2faPayload) {
  const result = await authApi.login2fa(body);

  if (!result.success) {
    return { error: result.error.message, requires2fa: true, nonce: body.nonce };
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
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [dismissedTotp, setDismissedTotp] = useState(false);

  const twoFactor =
    actionData && "requires2fa" in actionData && !dismissedTotp
      ? actionData
      : null;

  useEffect(() => {
    if (actionData && "requires2fa" in actionData) {
      setDismissedTotp(false);
      setApiError(null);
    }
    if (actionData && "error" in actionData && actionData.error) {
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
    setCredentials({ email: data.email, password: data.password });
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    submit(formData, { method: "post" });
  };

  const handleTotpComplete = (code: string) => {
    const nonce = twoFactor?.nonce;
    if (!credentials || !nonce || loading) return;
    setApiError(null);
    const formData = new FormData();
    formData.append("intent", "totp");
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);
    formData.append("totp", code);
    formData.append("nonce", nonce);
    submit(formData, { method: "post" });
  };

  if (twoFactor) {
    return (
      <AuthCard
        title="Verificação em duas etapas"
        subtitle={`Digite o código de 6 dígitos do seu app autenticador${credentials ? ` para ${credentials.email}` : ""}`}
      >
        <div className="space-y-6">
          <div className="py-4">
            <OtpInput
              length={6}
              onComplete={handleTotpComplete}
              onChange={() => setApiError(null)}
              disabled={loading}
              error={Boolean(apiError)}
            />
          </div>

          {apiError && <AlertMessage variant="error" message={apiError} />}

          {loading && (
            <div className="flex justify-center">
              <span className="w-5 h-5 border-2 border-brand-button/30 border-t-brand-button rounded-full animate-[spin_0.6s_linear_infinite]" />
            </div>
          )}

          <div className="text-center text-sm font-medium text-ink-secondary">
            <button
              type="button"
              onClick={() => {
                setDismissedTotp(true);
                setApiError(null);
              }}
              className="text-info hover:text-blue-700 font-semibold underline transition-colors duration-150"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </AuthCard>
    );
  }

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
