import { useEffect, useRef } from "react";

interface FetcherFeedbackOptions<T> {
  /** `fetcher.data` — tratado uma única vez por identidade. */
  data: T | null | undefined;
  /** `fetcher.state` — chama `onSubmitting` quando vira "submitting". */
  state: string;
  onResult: (data: NonNullable<T>) => void;
  onSubmitting?: () => void;
}

/**
 * Guarda `lastHandledResult` + limpa-erro-no-submitting que se repetiam
 * em todo modal com `useFetcher` (toast duplicado em re-render).
 */
export function useFetcherFeedback<T>(args: FetcherFeedbackOptions<T>) {
  const { data, state, onSubmitting } = args;
  const onResultRef = useRef(args.onResult);
  onResultRef.current = args.onResult;
  const onSubmittingRef = useRef(onSubmitting);
  onSubmittingRef.current = onSubmitting;
  const lastHandled = useRef<unknown>(null);

  useEffect(() => {
    if (!data || data === lastHandled.current) return;
    lastHandled.current = data;
    onResultRef.current(data as NonNullable<T>);
  }, [data]);

  useEffect(() => {
    if (state === "submitting") onSubmittingRef.current?.();
  }, [state]);
}
