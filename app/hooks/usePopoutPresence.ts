import { useEffect, useState } from "react";

const CHANNEL = "linkpix-popout";
const STORAGE_KEY = "linkpix:popout_open";
const HEARTBEAT_MS = 2000;
const STALE_MS = 5000;

function readOpen(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { open?: unknown; ts?: unknown };
    return (
      parsed.open === true && Date.now() - (parsed.ts as number) < STALE_MS
    );
  } catch {
    return false;
  }
}

function writeOpen(): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ open: true, ts: Date.now() }),
    );
  } catch {
    // Armazenamento indisponível: o BroadcastChannel ainda cobre a página.
  }
}

/** Announces that the queue popout is open via heartbeat. Lets the main page pause its own socket. */
export function useAnnouncePopout(): void {
  useEffect(() => {
    writeOpen();
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.postMessage("open");
    } catch {
      bc = null;
    }
    const heartbeat = setInterval(() => {
      writeOpen();
      try {
        bc?.postMessage("open");
      } catch {}
    }, HEARTBEAT_MS);
    const handleBeforeUnload = () => {
      try {
        bc?.postMessage("close");
      } catch {}
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
      try {
        bc?.close();
      } catch {}
    };
  }, []);
}

/** Tracks whether the queue popout is alive. Expires stale heartbeats from crashed popouts. */
export function useIsPopoutOpen(): boolean {
  const [open, setOpen] = useState<boolean>(() =>
    typeof window === "undefined" ? false : readOpen(),
  );

  useEffect(() => {
    setOpen(readOpen());
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.onmessage = (event) => {
        if (event.data === "open") setOpen(true);
        else if (event.data === "close") setOpen(readOpen());
      };
    } catch {
      bc = null;
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setOpen(readOpen());
    };
    window.addEventListener("storage", handleStorage);
    const expiry = setInterval(() => {
      setOpen((prev) => {
        const now = readOpen();
        return prev === now ? prev : now;
      });
    }, STALE_MS);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(expiry);
      try {
        bc?.close();
      } catch {}
    };
  }, []);

  return open;
}
