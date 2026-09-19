import { useEffect, useRef, useState } from "react";
import { getDonationView, resolveStatus } from "~/api/modules/public-donations";
import type { DonationStatus } from "~/types/donation";

const MAX_CONSECUTIVE_FAILURES = 5;

interface UseDonationStatusOptions {
  intervalMs?: number;
  enabled?: boolean;
}

export function useDonationStatus(
  donationId: string | null,
  { intervalMs = 8000, enabled = true }: UseDonationStatusOptions = {},
) {
  const [status, setStatus] = useState<DonationStatus>("pending");
  const [connectionLost, setConnectionLost] = useState(false);
  const failuresRef = useRef(0);

  useEffect(() => {
    setStatus("pending");
    setConnectionLost(false);
    failuresRef.current = 0;
    if (!donationId || !enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const view = await getDonationView(donationId);
        if (cancelled) return;
        if (!view) return;
        failuresRef.current = 0;
        setConnectionLost(false);
        const next = resolveStatus(view);
        setStatus(next);
        if (next === "pending") timer = setTimeout(poll, intervalMs);
      } catch {
        if (cancelled) return;
        failuresRef.current += 1;
        if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
          setConnectionLost(true);
        }
        timer = setTimeout(poll, intervalMs);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [donationId, enabled, intervalMs]);

  return { status, connectionLost };
}
