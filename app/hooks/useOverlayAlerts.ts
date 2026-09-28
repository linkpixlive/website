import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiUrl } from "~/api/http/client";
import { widgetsApi, type OverlaySettings } from "~/api/modules/widgets";
import type { OverlayDonationEntity } from "~/types/queue";
import { useOverlayAudio } from "./useOverlayAudio";

interface UseOverlayAlertsReturn {
  current: OverlayDonationEntity | null;
  settings: OverlaySettings | null;
  /** Token inexistente/resetado (GET público 404) — mostra erro fixo. */
  tokenInvalid: boolean;
}

const HEARTBEAT_INTERVAL_MS = 25000;

export function useOverlayAlerts(token: string | null): UseOverlayAlertsReturn {
  const [current, setCurrent] = useState<OverlayDonationEntity | null>(null);
  const [settings, setSettings] = useState<OverlaySettings | null>(null);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const volumeRef = useRef(1);

  const finish = useCallback((id: string) => {
    if (currentIdRef.current !== id) return;
    currentIdRef.current = null;
    setCurrent(null);
    socketRef.current?.emit("alert_finished", { id });
  }, []);

  const audio = useOverlayAudio(finish);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    stopHeartbeat();
    socket.emit("heartbeat_pulse");
    heartbeatTimerRef.current = setInterval(() => {
      socket.emit("heartbeat_pulse");
    }, HEARTBEAT_INTERVAL_MS);
  }, [stopHeartbeat]);

  const discardCurrent = useCallback(() => {
    audio.stop();
    currentIdRef.current = null;
    setCurrent(null);
  }, [audio]);

  const playDonation = useCallback(
    (donation: OverlayDonationEntity) => {
      currentIdRef.current = donation.id;
      setCurrent(donation);
      audio.play(donation.id, donation.audioUrl, volumeRef.current);
    },
    [audio],
  );

  useEffect(() => {
    if (!token) return;

    const loadSettings = () => {
      widgetsApi
        .getPublicSettings(token)
        .then((res) => {
          if (!res.success) {
            if (res.error.code === 404) setTokenInvalid(true);
            return;
          }
          setTokenInvalid(false);
          setSettings(res.data.settings as OverlaySettings);
        })
        .catch(() => {});
    };

    loadSettings();

    const socket = io(`${apiUrl}/overlay`, { query: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      startHeartbeat();
    });

    socket.on("disconnect", () => {
      stopHeartbeat();
    });

    socket.on("new_donation", (donation: OverlayDonationEntity) => {
      if (currentIdRef.current) return;
      playDonation(donation);
    });

    socket.on("skip_alert", discardCurrent);

    socket.on("clear_alerts", discardCurrent);

    socket.on("pause_alerts", discardCurrent);

    socket.on("settings_updated", loadSettings);

    /**
     * Fonte oculta (ex.: "olhinho" do OBS com shutdown desligado, ou aba em
     * segundo plano) conta como overlay offline: para o playback local e
     * desconecta o socket, pausando a fila no backend. Ao voltar a ficar
     * visível, reconecta e o backend reenvia o alerta atual + despacha
     * a fila pendente. Sem `alert_finished` no hide, o alerta reinicia
     * do início em vez de ser consumido invisível.
     */
    const handleVisibilityChange = () => {
      if (document.hidden) {
        discardCurrent();
        stopHeartbeat();
        socket.disconnect();
      } else if (socket.disconnected) {
        socket.connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopHeartbeat();
      discardCurrent();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, playDonation, discardCurrent, startHeartbeat, stopHeartbeat]);

  useEffect(() => {
    const raw = settings?.volume ?? 100;
    const volume = Math.min(Math.max(raw, 0), 100) / 100;
    volumeRef.current = volume;
    audio.setVolume(volume);
  }, [settings, audio]);

  return {
    current,
    settings,
    tokenInvalid,
  };
}
