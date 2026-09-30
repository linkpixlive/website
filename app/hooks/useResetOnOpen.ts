import { useEffect, useRef } from "react";

/** Runs reset on closed-to-open transition to clear stale modal state. */
export function useResetOnOpen(isOpen: boolean, reset: () => void) {
  const resetRef = useRef(reset);
  resetRef.current = reset;
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) resetRef.current();
    wasOpen.current = isOpen;
  }, [isOpen]);
}
