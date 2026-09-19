import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { apiUrl } from "~/api/http/client";
import type { OverlayDonationEntity } from "~/types/queue";

interface UseQueueSocketReturn {
  queue: OverlayDonationEntity[];
  isPaused: boolean;
}

export function useQueueSocket(token: string | null): UseQueueSocketReturn {
  const [queue, setQueue] = useState<OverlayDonationEntity[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io(`${apiUrl}/dashboard`, {
      auth: { token },
    });

    socket.on("queue_sync", (data: OverlayDonationEntity[]) => {
      setQueue(data);
    });

    socket.on("overlay_status", (data: { online: boolean; isPaused?: boolean }) => {
      if (data.isPaused !== undefined) {
        setIsPaused(data.isPaused);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return { queue, isPaused };
}
