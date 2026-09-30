import { useState } from "react";
import type { useFetcher } from "react-router";
import { useToast } from "~/contexts/useToast";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import type { ProfileActionResult } from "./profile-result";

export function useProfileActionFeedback(
  fetcher: ReturnType<typeof useFetcher<ProfileActionResult>>,
  onSuccess?: () => void,
) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useFetcherFeedback({
    data: fetcher.data,
    state: fetcher.state,
    onResult: (result) => {
      if (result.success) {
        setError(null);
        if (result.message) toast(result.message, "success");
        onSuccess?.();
      } else if (result.error) {
        setError(result.error);
      }
    },
    onSubmitting: () => setError(null),
  });

  return error;
}
