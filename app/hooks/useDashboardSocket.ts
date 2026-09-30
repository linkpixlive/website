import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiUrl } from "~/api/http/client";

interface DashboardSocketEntry {
  socket: Socket;
  refcount: number;
}

// Singleton por token: um `io(/dashboard)` compartilhado por todos os
// hooks da página, não um por hook (W1). Sem isso, fila + histórico
// abrem 2 conexões idênticas — 4 com o popout aberto.
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

/**
 * Socket `/dashboard` compartilhado com lazy connect (W3): só conecta
 * com a aba visível; `hidden` desconecta, `visible` reconecta (mesmo
 * padrão de `useOverlayAlerts`). `enabled=false` (ex.: popout aberto,
 * W7) nem adquire o socket. `connect/disconnect` são idempotentes no
 * socket.io, então N consumidores na mesma página são seguros.
 */
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
