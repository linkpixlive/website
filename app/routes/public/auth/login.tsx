import { useEffect, useState } from "react";
import { redirect, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import {
  authApi,
  type Login2faPayload,
} from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { LoginForm } from "~/components/auth/LoginForm";
import { TotpChallenge } from "~/components/auth/TotpChallenge";
import { createAuthCookie, getAuthToken } from "~/util/session.server";
import { loginSchema } from "~/validators/auth-validator";
import type { Route } from "./+types/login";

export function loader({ request }: Route.LoaderArgs) {
  if (getAuthToken(request)) throw redirect("/dashboard");
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Entrar — LinkPix" }];
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

  return redirect("/dashboard", {
    headers: { "Set-Cookie": createAuthCookie(result.data) },
  });
}

async function handleLogin2fa(body: Login2faPayload) {
  const result = await authApi.login2fa(body);

  if (!result.success) {
    return { error: result.error.message, requires2fa: true, nonce: body.nonce };
  }

  return redirect("/dashboard", {
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
  const [step, setStep] = useState<"login" | "totp">("login");

  const nonce =
    actionData && "requires2fa" in actionData ? actionData.nonce : null;

  useEffect(() => {
    if (actionData && "requires2fa" in actionData) {
      setStep("totp");
      setApiError(null);
    } else if (actionData && "error" in actionData && actionData.error) {
      setApiError(actionData.error);
    }
  }, [actionData]);

  const onSubmit = (data: LoginFormValues) => {
    setCredentials({ email: data.email, password: data.password });
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    submit(formData, { method: "post" });
  };

  const handleBack = () => {
    setStep("login");
    setApiError(null);
  };

  if (step === "totp" && nonce && credentials) {
    return (
      <AuthCard
        title="Verificação em duas etapas"
        subtitle={`Digite o código de 6 dígitos do seu app autenticador para ${credentials.email}`}
      >
        <TotpChallenge
          credentials={credentials}
          nonce={nonce}
          loading={loading}
          apiError={apiError}
          onClearError={() => setApiError(null)}
          onBack={handleBack}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Bem-vindo de volta!" subtitle="Entre em sua conta">
      <LoginForm
        loading={loading}
        apiError={apiError}
        onClearError={() => setApiError(null)}
        onSubmit={onSubmit}
      />
    </AuthCard>
  );
}
