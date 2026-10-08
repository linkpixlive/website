import { useEffect, useState } from "react";
import { redirect, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import {
  authApi,
  type Login2faPayload,
} from "~/api/modules/auth";
import { AuthShell } from "~/components/auth/AuthShell";
import { AuthSplit } from "~/components/auth/AuthSplit";
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
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (intent === "totp") {
    const totp = String(formData.get("totp") ?? "");
    const nonce = String(formData.get("nonce") ?? "");
    if (totp.length !== 6 || !nonce) {
      return { error: "Código de verificação inválido." };
    }
    return handleLogin2fa({ email, password, totp, nonce });
  }

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
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
    if (actionData && "error" in actionData && actionData.error) {
      setApiError(actionData.error);
      if ("requires2fa" in actionData) {
        setStep("totp");
      }
    } else if (actionData && "requires2fa" in actionData) {
      setStep("totp");
      setApiError(null);
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
      <AuthShell
        eyebrow="Segurança"
        title="Digite o código"
        lede={
          <>
            Código de 6 dígitos do seu app autenticador para{" "}
            <span className="font-semibold text-ink-heading">{credentials.email}</span>.
          </>
        }
      >
        <TotpChallenge
          credentials={credentials}
          nonce={nonce}
          loading={loading}
          apiError={apiError}
          onClearError={() => setApiError(null)}
          onBack={handleBack}
        />
      </AuthShell>
    );
  }

  return (
    <AuthSplit
      tone="login"
      eyebrow="Entrar"
      title="Bem-vindo de volta"
      lede="Entre para ver seu saldo e seus alertas."
      aside={{ to: "/auth/register", label: "Criar conta" }}
    >
      <LoginForm
        loading={loading}
        apiError={apiError}
        onClearError={() => setApiError(null)}
        onSubmit={onSubmit}
      />
    </AuthSplit>
  );
}
