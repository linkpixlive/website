import { useEffect, useRef } from "react";

interface FetcherFeedbackOptions<T> {
  data: T | null | undefined;
  state: string;
  onResult: (data: NonNullable<T>) => void;
  onSubmitting?: () => void;
}

/** Handles fetcher result exactly once and clears feedback on submit. Prevents duplicate toasts on re-render. */
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
