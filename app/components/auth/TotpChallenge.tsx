import { useSubmit } from "react-router";
import { OtpInput } from "./OtpInput";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Spinner } from "~/components/ui/Spinner";

interface TotpChallengeProps {
  credentials: { email: string; password: string };
  nonce: string;
  loading: boolean;
  apiError: string | null;
  onClearError: () => void;
  onBack: () => void;
}

/** Etapa 2 do login: código TOTP do app autenticador. */
export function TotpChallenge({
  credentials,
  nonce,
  loading,
  apiError,
  onClearError,
  onBack,
}: TotpChallengeProps) {
  const submit = useSubmit();

  const handleTotpComplete = (code: string) => {
    if (loading) return;
    onClearError();
    const formData = new FormData();
    formData.append("intent", "totp");
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);
    formData.append("totp", code);
    formData.append("nonce", nonce);
    submit(formData, { method: "post" });
  };

  return (
    <div className="space-y-6">
      <div className="py-4">
        <OtpInput
          length={6}
          onComplete={handleTotpComplete}
          onChange={onClearError}
          disabled={loading}
          error={Boolean(apiError)}
        />
      </div>

      {apiError && <AlertMessage variant="error" message={apiError} />}

      {loading && (
        <div className="flex justify-center">
          <Spinner size="md" tone="brand" />
        </div>
      )}

      <div className="text-center text-sm font-medium text-ink-secondary">
        <button
          type="button"
          onClick={onBack}
          className="text-info hover:text-info-hover font-semibold underline transition-colors duration-150"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );
}
