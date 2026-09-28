import { useEffect } from "react";

/** Registro global: só um áudio toca por vez na página. */
const activePlayers = new Set<() => void>();

function pauseAll() {
  for (const pause of activePlayers) pause();
}

/**
 * Exclusão mútua de áudio entre `AudioPlayer` e `VoiceSampleButton`
 * (antes cada um tinha seu `Set` e não se conheciam).
 */
export function useExclusiveAudio(
  audioRef: React.RefObject<HTMLAudioElement | null>,
) {
  useEffect(() => {
    const pause = () => audioRef.current?.pause();
    activePlayers.add(pause);
    return () => {
      activePlayers.delete(pause);
      audioRef.current?.pause();
    };
  }, [audioRef]);

  return pauseAll;
}
