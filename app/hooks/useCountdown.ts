import { useEffect, useState } from "react";

function getRemainingSeconds(target: number): number {
  return Math.max(0, Math.ceil((target - Date.now()) / 1000));
}

export function formatRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function useCountdown(target: number | null) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    target ? getRemainingSeconds(target) : 0,
  );

  useEffect(() => {
    if (!target) return;
    setRemainingSeconds(getRemainingSeconds(target));

    const interval = setInterval(() => {
      const next = getRemainingSeconds(target);
      setRemainingSeconds(next);
      if (next <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  return {
    remainingSeconds,
    formatted: formatRemaining(remainingSeconds),
    isExpired: remainingSeconds <= 0,
  };
}
