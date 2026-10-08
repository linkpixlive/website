import { useEffect, useState } from "react";
import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router";
import { authApi } from "~/api/modules/auth";
import { AuthShell } from "~/components/auth/AuthShell";
import { OtpField } from "~/components/auth/OtpField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Spinner } from "~/components/ui/Spinner";
import { useActionError } from "~/hooks/useActionError";
import { createAuthCookie } from "~/util/session.server";
import { verifyEmailSchema } from "~/validators/auth-validator";
import type { Route } from "./+types/verify-email";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Verificar e-mail — LinkPix" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const otp = String(formData.get("otp") ?? "");
  const email = String(formData.get("email") ?? "");

  const parsed = verifyEmailSchema.safeParse({ otp, email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await authApi.verifyOtp({ otp, email });

  if (!result.success) {
    return { error: result.error.message };
  }

  return redirect("/dashboard", {
    headers: { "Set-Cookie": createAuthCookie(result.data) },
  });
}

export default function VerifyEmail({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const [clientError, setClientError] = useState<string | null>(null);
  const [apiError, clearApiError] = useActionError(actionData);

  // If no email in URL, they shouldn't be here
  useEffect(() => {
    if (!email) {
      navigate("/auth/register", { replace: true });
    }
  }, [email, navigate]);

  const handleComplete = (code: string) => {
    setClientError(null);
    clearApiError();
    const parsed = verifyEmailSchema.safeParse({ otp: code, email });
    if (!parsed.success) {
      setClientError(parsed.error.issues[0].message);
      return;
    }

    const formData = new FormData();
    formData.append("otp", code);
    formData.append("email", email || "");

    submit(formData, { method: "post" });
  };

  const displayError = clientError || apiError;

  if (!email) return null; // Avoid flicker before redirect

  return (
    <AuthShell
      eyebrow="Quase lá"
      title="Digite o código"
      lede={
        <>
          Enviamos 6 dígitos para{" "}
          <span className="font-semibold text-ink-heading">{email}</span>.
        </>
      }
    >
      <div className="space-y-6">
        <OtpField
          onComplete={handleComplete}
          onChange={() => {
            setClientError(null);
            clearApiError();
          }}
          disabled={loading}
          error={!!displayError}
        />

        {displayError && (
          <AlertMessage variant="error" message={displayError} />
        )}

        {loading && (
          <div className="flex justify-center">
            <Spinner size="md" tone="brand" />
          </div>
        )}

        <p className="text-center text-sm font-medium text-ink-secondary">
          Não recebeu o código?{" "}
          <Link
            to="/auth/login"
            className="text-info hover:text-info-hover font-semibold underline transition-colors duration-150"
          >
            Reenviar
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
