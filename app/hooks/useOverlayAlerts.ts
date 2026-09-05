import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiUrl } from "~/api/http/client";
import { widgetsApi, type OverlaySettings } from "~/api/modules/widgets";
import type { OverlayDonationEntity } from "~/types/queue";

interface UseOverlayAlertsReturn {
  current: OverlayDonationEntity | null;
  isPaused: boolean;
  isConnected: boolean;
  settings: OverlaySettings | null;
  audioBlocked: boolean;
  unlockAudio: () => void;
}

const HEARTBEAT_INTERVAL_MS = 25000;
const NO_AUDIO_FALLBACK_MS = 6000;

export function useOverlayAlerts(token: string | null): UseOverlayAlertsReturn {
  const [current, setCurrent] = useState<OverlayDonationEntity | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState<OverlaySettings | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const volumeRef = useRef(1);

  const teardownAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audioRef.current = null;
  }, []);

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
    setAudioBlocked(false);
  }, [clearFinishTimer, teardownAudio]);

  const finish = useCallback(
    (id: string) => {
      clearFinishTimer();
      teardownAudio();
      if (currentIdRef.current !== id) return;
      currentIdRef.current = null;
      setCurrent(null);
      setAudioBlocked(false);
      socketRef.current?.emit("alert_finished", { id });
    },
    [clearFinishTimer, teardownAudio],
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
      audio.onerror = () => finish(donation.id);
      audioRef.current = audio;
      audio.play().catch(() => setAudioBlocked(true));
    },
    [finish],
  );

  useEffect(() => {
    if (!token) return;

    const loadSettings = () => {
      widgetsApi
        .getPublicSettings("overlay", token)
        .then((res) => {
          if (!res.success) return;
          setSettings(res.data.settings as OverlaySettings);
          setIsPaused(res.data.settings.isPaused ?? false);
        })
        .catch(() => {});
    };

    loadSettings();

    const socket = io(`${apiUrl}/overlay`, { query: { token } });
    socketRef.current = socket;

    const startHeartbeat = () => {
      stopHeartbeat();
      socket.emit("heartbeat_pulse");
      heartbeatTimerRef.current = setInterval(() => {
        socket.emit("heartbeat_pulse");
      }, HEARTBEAT_INTERVAL_MS);
    };

    const stopHeartbeat = () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    socket.on("connect", () => {
      setIsConnected(true);
      startHeartbeat();
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      stopHeartbeat();
    });

    socket.on("new_donation", (donation: OverlayDonationEntity) => {
      if (currentIdRef.current) return;
      playDonation(donation);
    });

    socket.on("skip_alert", discardCurrent);

    socket.on("clear_alerts", discardCurrent);

    socket.on("pause_alerts", () => {
      discardCurrent();
      setIsPaused(true);
    });

    socket.on("resume_alerts", () => setIsPaused(false));

    socket.on("settings_updated", loadSettings);

    return () => {
      stopHeartbeat();
      clearFinishTimer();
      teardownAudio();
      currentIdRef.current = null;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, playDonation, discardCurrent, finish, clearFinishTimer, teardownAudio]);

  useEffect(() => {
    const raw = settings?.volume ?? 100;
    const volume = Math.min(Math.max(raw, 0), 100) / 100;
    volumeRef.current = volume;
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [settings]);

  const unlockAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      setAudioBlocked(false);
      return;
    }
    audio.volume = volumeRef.current;
    audio
      .play()
      .then(() => setAudioBlocked(false))
      .catch(() => {});
  }, []);

  return {
    current,
    isPaused,
    isConnected,
    settings,
    audioBlocked,
    unlockAudio,
  };
}
