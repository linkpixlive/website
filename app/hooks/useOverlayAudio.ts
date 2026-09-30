import { useCallback, useEffect, useMemo, useRef } from "react";
import { isSafeMediaUrl } from "~/util/safe-url";

const NO_AUDIO_FALLBACK_MS = 6000;
const AUDIO_ERROR_FALLBACK_MS = 2500;
const AUDIO_RETRY_INTERVAL_MS = 1000;

interface UseOverlayAudio {
  play: (id: string, audioUrl: string | null, volume: number) => void;
  stop: () => void;
  setVolume: (volume01: number) => void;
}

/** Plays a single alert audio with volume control. Retries on autoplay block and falls back to a timer when audio is missing. */
export function useOverlayAudio(onComplete: (id: string) => void): UseOverlayAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef = useRef(1);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const clearFinishTimer = useCallback(() => {
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearRetryTimer();
    clearFinishTimer();
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    }
  }, [clearRetryTimer, clearFinishTimer]);

  const attemptPlay = useCallback(
    (audio: HTMLAudioElement) => {
      audio.play().catch(() => {
        if (retryTimerRef.current) return;
        retryTimerRef.current = setInterval(() => {
          audio
            .play()
            .then(() => clearRetryTimer())
            .catch(() => {});
        }, AUDIO_RETRY_INTERVAL_MS);
      });
    },
    [clearRetryTimer],
  );

  const play = useCallback(
    (id: string, audioUrl: string | null, volume: number) => {
      stop();
      volumeRef.current = volume;

      if (!audioUrl || !isSafeMediaUrl(audioUrl)) {
        finishTimerRef.current = setTimeout(
          () => onCompleteRef.current(id),
          NO_AUDIO_FALLBACK_MS,
        );
        return;
      }

      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.onended = () => onCompleteRef.current(id);
      audio.onerror = () => {
        finishTimerRef.current = setTimeout(
          () => onCompleteRef.current(id),
          AUDIO_ERROR_FALLBACK_MS,
        );
      };
      audioRef.current = audio;
      attemptPlay(audio);
    },
    [stop, attemptPlay],
  );

  const setVolume = useCallback((volume01: number) => {
    volumeRef.current = volume01;
    if (audioRef.current) {
      audioRef.current.volume = volume01;
    }
  }, []);

  useEffect(() => stop, [stop]);

  return useMemo(
    () => ({ play, stop, setVolume }),
    [play, stop, setVolume],
  );
}
