import { useEffect, useState } from "react";
import { getDonationStatus } from "~/api/modules/public-donations";
import type { DonationStatus } from "~/types/donation";

interface UseDonationStatusOptions {
  intervalMs?: number;
  enabled?: boolean;
}

export function useDonationStatus(
  donationId: string | null,
  { intervalMs = 3000, enabled = true }: UseDonationStatusOptions = {},
) {
  const [status, setStatus] = useState<DonationStatus>("pending");

  useEffect(() => {
    setStatus("pending");
    if (!donationId || !enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const next = await getDonationStatus(donationId);
        if (cancelled) return;
        setStatus(next);
        if (next === "pending") timer = setTimeout(poll, intervalMs);
      } catch {
        if (!cancelled) timer = setTimeout(poll, intervalMs);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [donationId, enabled, intervalMs]);

  return { status };
}
