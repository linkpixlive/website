import { useEffect, useState } from "react";
import type { OverlayDonationEntity } from "~/types/queue";
import { useDashboardSocket } from "./useDashboardSocket";

interface UseQueueSocketReturn {
  queue: OverlayDonationEntity[];
  isPaused: boolean;
}

export function useQueueSocket(
  token: string | null,
  enabled = true,
): UseQueueSocketReturn {
  const [queue, setQueue] = useState<OverlayDonationEntity[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const socket = useDashboardSocket(token, enabled);

  useEffect(() => {
    if (!socket) return;

    const onQueueSync = (data: OverlayDonationEntity[]) => {
      setQueue(data);
    };
    const onOverlayStatus = (data: {
      online: boolean;
      isPaused?: boolean;
    }) => {
      if (data.isPaused !== undefined) {
        setIsPaused(data.isPaused);
      }
    };

    socket.on("queue_sync", onQueueSync);
    socket.on("overlay_status", onOverlayStatus);

    return () => {
      socket.off("queue_sync", onQueueSync);
      socket.off("overlay_status", onOverlayStatus);
    };
  }, [socket]);

  return { queue, isPaused };
}
