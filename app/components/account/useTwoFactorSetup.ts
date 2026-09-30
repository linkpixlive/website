import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { useToast } from "~/contexts/useToast";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";
import { buildIntentFormData } from "~/util/submit-intent";

interface SetupPayload {
  otpauthUrl: string;
  secret: string;
}

type FetcherData =
  | { success: true; action: string; message?: string; data?: SetupPayload }
  | { success: false; action: string; error: string }
  | null;

function isAction(
  data: FetcherData,
  action: string,
): data is Extract<NonNullable<FetcherData>, { action: string }> {
  return Boolean(data && data.action === action);
}

export function useTwoFactorSetup({
  isOpen,
  enabled,
  onClose,
}: {
  isOpen: boolean;
  enabled: boolean;
  onClose: () => void;
}) {
  const fetcher = useFetcher();
  const loading = fetcher.state === "submitting";
  const { toast } = useToast();
  const [localError, setLocalError] = useState<string | null>(null);
  const tokenRef = useRef("");

  const data = fetcher.data as FetcherData;

  const setupSucceeded = isAction(data, "2faSetup") && data.success;
  const setupPayload = setupSucceeded
    ? (data as { data?: SetupPayload }).data
    : undefined;
  const setupError =
    isAction(data, "2faSetup") && !data.success ? data.error : null;
  const submitError =
    (isAction(data, "2faEnable") || isAction(data, "2faDisable")) &&
    !data.success
      ? data.error
      : null;

  const error = localError ?? submitError;

  useEffect(() => {
    if (fetcher.state === "submitting") {
      setLocalError(null);
    }
  }, [fetcher.state]);

  useFetcherFeedback({
    data,
    state: fetcher.state,
    onResult: (result: NonNullable<FetcherData>) => {
      if (
        (isAction(result, "2faEnable") || isAction(result, "2faDisable")) &&
        result.success
      ) {
        toast(
          result.message ?? "Autenticação em dois fatores atualizada.",
          "success",
        );
        onClose();
      }
    },
  });

  useResetOnOpen(isOpen, () => {
    tokenRef.current = "";
    setLocalError(null);
  });

  const submitIntent = (intent: string, values: Record<string, string>) => {
    fetcher.submit(buildIntentFormData(intent, values), { method: "post" });
  };

  const onTokenChange = useCallback((token: string) => {
    tokenRef.current = token;
  }, []);

  const handleCodeComplete = (code: string) => {
    if (loading) return;
    setLocalError(null);
    submitIntent("2faEnable", { token: code });
  };

  const handleDisable = (password: string) => {
    if (loading) return;
    if (tokenRef.current.length !== 6) {
      setLocalError("Digite o código de 6 dígitos do seu app autenticador.");
      return;
    }
    setLocalError(null);
    submitIntent("2faDisable", { password, token: tokenRef.current });
  };

  const handleStartSetup = (password: string) => {
    if (loading) return;
    if (!password) {
      setLocalError("Confirme com sua senha para gerar o segredo.");
      return;
    }
    setLocalError(null);
    submitIntent("2faSetup", { password });
  };

  return {
    loading,
    error,
    setupPayload,
    setupError,
    onTokenChange,
    handleCodeComplete,
    handleDisable,
    handleStartSetup,
  };
}
