import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiUrl } from "~/api/http/client";
import { widgetsApi, type OverlaySettings } from "~/api/modules/widgets";
import type { OverlayDonationEntity } from "~/types/queue";

interface UseOverlayAlertsReturn {
  current: OverlayDonationEntity | null;
  settings: OverlaySettings | null;
  /** Token inexistente/resetado (GET público 404) — mostra erro fixo. */
  tokenInvalid: boolean;
}

const HEARTBEAT_INTERVAL_MS = 25000;
const NO_AUDIO_FALLBACK_MS = 6000;
/**
 * Áudio com URL quebrada (ex.: objeto removido do R2): mantém o card visível
 * por um tempo mínimo antes de avançar a fila, em vez de consumir o alerta
 * em milissegundos (flash entra-e-sai). O backend já degrada para
 * `audioUrl: null` quando detecta a falta; isto cobre a corrida entre a
 * checagem e o playback.
 */
const AUDIO_ERROR_FALLBACK_MS = 2500;
/** Intervalo entre tentativas silenciosas de `play()` quando o autoplay é bloqueado. */
const AUDIO_RETRY_INTERVAL_MS = 1000;

export function useOverlayAlerts(token: string | null): UseOverlayAlertsReturn {
  const [current, setCurrent] = useState<OverlayDonationEntity | null>(null);
  const [settings, setSettings] = useState<OverlaySettings | null>(null);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRetryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const volumeRef = useRef(1);

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

  const clearAudioRetryTimer = useCallback(() => {
    if (audioRetryTimerRef.current) {
      clearInterval(audioRetryTimerRef.current);
      audioRetryTimerRef.current = null;
    }
  }, []);

  const teardownAudio = useCallback(() => {
    clearAudioRetryTimer();
    const audio = audioRef.current;
    if (!audio) return;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audioRef.current = null;
  }, [clearAudioRetryTimer]);

  const clearFinishTimer = useCallback(() => {
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  }, []);

  const discardCurrent = useCallback(() => {
    clearFinishTimer();
    teardownAudio();
    currentIdRef.current = null;
    setCurrent(null);
  }, [clearFinishTimer, teardownAudio]);

  const finish = useCallback(
    (id: string) => {
      clearFinishTimer();
      teardownAudio();
      if (currentIdRef.current !== id) return;
      currentIdRef.current = null;
      setCurrent(null);
      socketRef.current?.emit("alert_finished", { id });
    },
    [clearFinishTimer, teardownAudio],
  );

  /**
   * Toca o áudio automaticamente. Se o navegador bloquear o autoplay
   * (política de autoplay do Chrome), tenta de novo em silêncio até
   * conseguir — sem exibir botão ou popup. Em browser source do OBS o
   * autoplay é liberado, então a primeira tentativa já funciona.
   */
  const attemptPlay = useCallback(
    (audio: HTMLAudioElement) => {
      audio.play().catch(() => {
        if (audioRetryTimerRef.current) return;
        audioRetryTimerRef.current = setInterval(() => {
          audio
            .play()
            .then(() => clearAudioRetryTimer())
            .catch(() => {});
        }, AUDIO_RETRY_INTERVAL_MS);
      });
    },
    [clearAudioRetryTimer],
  );

  const playDonation = useCallback(
    (donation: OverlayDonationEntity) => {
      currentIdRef.current = donation.id;
      setCurrent(donation);

      if (!donation.audioUrl) {
        finishTimerRef.current = setTimeout(
          () => finish(donation.id),
          NO_AUDIO_FALLBACK_MS,
        );
        return;
      }

      const audio = new Audio(donation.audioUrl);
      audio.volume = volumeRef.current;
      audio.onended = () => finish(donation.id);
      audio.onerror = () => {
        finishTimerRef.current = setTimeout(
          () => finish(donation.id),
          AUDIO_ERROR_FALLBACK_MS,
        );
      };
      audioRef.current = audio;
      attemptPlay(audio);
    },
    [finish, attemptPlay],
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
      clearFinishTimer();
      teardownAudio();
      currentIdRef.current = null;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, playDonation, discardCurrent, finish, clearFinishTimer, teardownAudio, startHeartbeat, stopHeartbeat]);

  useEffect(() => {
    const raw = settings?.volume ?? 100;
    const volume = Math.min(Math.max(raw, 0), 100) / 100;
    volumeRef.current = volume;
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [settings]);

  return {
    current,
    settings,
    tokenInvalid,
  };
}
