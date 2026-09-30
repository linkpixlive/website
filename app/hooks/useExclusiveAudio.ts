import { useEffect } from "react";

const activePlayers = new Set<() => void>();

function pauseAll() {
  for (const pause of activePlayers) pause();
}

/** Registers audio for mutual exclusion. Starting one pauses all others on the page. */
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
