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
import { AuthCard } from "~/components/auth/AuthCard";
import { OtpInput } from "~/components/auth/OtpInput";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Spinner } from "~/components/ui/Spinner";
import { createAuthCookie } from "~/util/session.server";
import { verifyEmailSchema } from "~/validators/auth-validator";
import type { Route } from "./+types/verify-email";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Verify Email — LinkPix" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const otp = formData.get("otp") as string;
  const email = formData.get("email") as string;

  const result = await authApi.verifyOtp({ otp, email });

  if (!result.success) {
    return { error: result.error.message };
  }

  return redirect("/", {
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
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync action error
  useEffect(() => {
    if (actionData?.error) {
      setApiError(actionData.error);
    }
  }, [actionData]);

  // If no email in URL, they shouldn't be here
  useEffect(() => {
    if (!email) {
      navigate("/auth/register", { replace: true });
    }
  }, [email, navigate]);

  const handleComplete = (code: string) => {
    setClientError(null);
    setApiError(null);
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
    <AuthCard
      title="Verifique seu e-mail"
      subtitle={`Informe o código de 6 dígitos enviado para ${email}`}
    >
      <div className="space-y-6">
        <div className="py-4">
          <OtpInput
            length={6}
            onComplete={handleComplete}
            onChange={() => {
              setClientError(null);
              setApiError(null);
            }}
            disabled={loading}
            error={!!displayError}
          />
        </div>

        {displayError && (
          <AlertMessage variant="error" message={displayError} />
        )}

        {loading && (
          <div className="flex justify-center">
            <Spinner size="md" tone="brand" />
          </div>
        )}

        <div className="mt-6 text-center text-sm font-medium text-ink-secondary">
          <p>Não recebeu o código?</p>
          <Link
            to="/auth/login"
            className="inline-block mt-1 text-info hover:text-blue-700 font-semibold underline transition-colors duration-150"
          >
            Reenviar
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
