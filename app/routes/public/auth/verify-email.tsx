import { useEffect, useState } from "react";
import {
  redirect,
  useFetcher,
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
import { useCountdown } from "~/hooks/useCountdown";
import { createAuthCookie } from "~/util/session.server";
import {
  registerInitSchema,
  verifyEmailSchema,
} from "~/validators/auth-validator";
import type { Route } from "./+types/verify-email";

const RESEND_COOLDOWN_MS = 60_000;

export function meta({}: Route.MetaArgs) {
  return [{ title: "Verificar e-mail — LinkPix" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  if (String(formData.get("intent") ?? "") === "resend") {
    const parsed = registerInitSchema.safeParse({
      email: String(formData.get("email") ?? ""),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }
    const result = await authApi.registerInit(parsed.data);
    if (!result.success) {
      return { error: result.error.message };
    }
    return { resent: true };
  }

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

  if (typeof result.data === "string") {
    return redirect("/dashboard", {
      headers: { "Set-Cookie": createAuthCookie(result.data) },
    });
  }

  if ("requiresRegistrationCompletion" in result.data) {
    const params = new URLSearchParams({ email });
    const username = new URL(request.url).searchParams.get("username");
    if (username) params.set("username", username);
    return redirect(`/auth/register/complete?${params.toString()}`);
  }

  return redirect("/auth/login");
}

export default function VerifyEmail({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const submit = useSubmit();
  const fetcher = useFetcher<typeof action>();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const [clientError, setClientError] = useState<string | null>(null);
  const [apiError, clearApiError] = useActionError(actionData);

  const [resendTarget, setResendTarget] = useState<number | null>(null);
  const countdown = useCountdown(resendTarget);

  useEffect(() => {
    if (!email) {
      navigate("/auth/register", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    setResendTarget(Date.now() + RESEND_COOLDOWN_MS);
  }, []);

  useEffect(() => {
    if (fetcher.data && "resent" in fetcher.data && fetcher.data.resent) {
      setResendTarget(Date.now() + RESEND_COOLDOWN_MS);
    }
  }, [fetcher.data]);

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

  const handleResend = () => {
    const formData = new FormData();
    formData.append("intent", "resend");
    formData.append("email", email || "");
    fetcher.submit(formData, { method: "post" });
  };

  const resendError =
    fetcher.data && "error" in fetcher.data
      ? (fetcher.data.error ?? null)
      : null;
  const resendCooldown = !countdown.isExpired;
  const resending = fetcher.state !== "idle";

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

        <div className="text-center">
          {resendCooldown ? (
            <p className="text-sm font-medium text-ink-secondary">
              Reenviar código em {countdown.formatted}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-semibold text-info hover:text-info-hover underline transition-colors duration-150 disabled:opacity-60"
            >
              {resending ? "Reenviando..." : "Reenviar código"}
            </button>
          )}
          {resendError && (
            <p className="mt-2 text-[13px] font-medium text-error">
              {resendError}
            </p>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
