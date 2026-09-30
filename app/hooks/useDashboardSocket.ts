import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiUrl } from "~/api/http/client";

interface DashboardSocketEntry {
  socket: Socket;
  refcount: number;
}

const entries = new Map<string, DashboardSocketEntry>();

function acquire(token: string): Socket {
  const entry = entries.get(token);
  if (entry) {
    entry.refcount += 1;
    return entry.socket;
  }
  const socket = io(`${apiUrl}/dashboard`, {
    auth: { token },
    autoConnect: false,
  });
  entries.set(token, { socket, refcount: 1 });
  return socket;
}

function release(token: string): void {
  const entry = entries.get(token);
  if (!entry) return;
  entry.refcount -= 1;
  if (entry.refcount <= 0) {
    entries.delete(token);
    entry.socket.disconnect();
  }
}

/** Shared /dashboard socket with lazy connect. Disconnects when the tab is hidden or disabled (e.g. popout takes over). */
export function useDashboardSocket(
  token: string | null,
  enabled = true,
): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token || !enabled) {
      setSocket(null);
      return;
    }
    const shared = acquire(token);
    setSocket(shared);
    if (document.visibilityState !== "hidden" && !shared.connected) {
      shared.connect();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        shared.disconnect();
      } else if (shared.disconnected) {
        shared.connect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setSocket(null);
      release(token);
    };
  }, [token, enabled]);

  return socket;
}
