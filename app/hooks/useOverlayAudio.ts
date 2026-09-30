import { useCallback, useEffect, useMemo, useRef } from "react";
import { isSafeMediaUrl } from "~/util/safe-url";

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

interface UseOverlayAudio {
  /** Toca o alerta; toda conclusão (fim/erro/sem-áudio) chama onComplete(id). */
  play: (id: string, audioUrl: string | null, volume: number) => void;
  /** Para tudo sem chamar onComplete (skip/pause/unmount). */
  stop: () => void;
  /** Volume 0–1, aplicado ao vivo se houver playback. */
  setVolume: (volume01: number) => void;
}

/**
 * Playback de um alerta do overlay. Toda conclusão funila para
 * `onComplete(id)` — o orquestrador decide (emitir `alert_finished`, etc.).
 */
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

  /**
   * Toca o áudio automaticamente. Se o navegador bloquear o autoplay
   * (política de autoplay do Chrome), tenta de novo em silêncio até
   * conseguir — sem exibir botão ou popup. Em browser source do OBS o
   * autoplay é liberado, então a primeira tentativa já funciona.
   */
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
