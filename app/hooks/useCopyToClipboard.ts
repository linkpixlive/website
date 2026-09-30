import { useCallback, useEffect, useRef, useState } from "react";

const COPY_RESET_MS = 1600;

/** Copies text to clipboard with temporary copied feedback. */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), COPY_RESET_MS);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copied, copy };
}
