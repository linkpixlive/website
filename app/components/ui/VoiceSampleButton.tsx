import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { useExclusiveAudio } from "~/hooks/useExclusiveAudio";
import { isSafeMediaUrl } from "~/util/safe-url";

interface VoiceSampleButtonProps {
  src: string;
  voiceName: string;
}

/** Play/pause compacto para a amostra de voz; garante um áudio por vez. */
export function VoiceSampleButton({ src, voiceName }: VoiceSampleButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [broken, setBroken] = useState(false);
  const pauseAll = useExclusiveAudio(audioRef);

  if (broken || !isSafeMediaUrl(src)) return null;

  function handleToggle(event: React.MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      return;
    }
    pauseAll();
    audio.play().catch(() => setBroken(true));
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      onKeyDown={(event) => event.stopPropagation()}
      aria-label={isPlaying ? `Pausar amostra da voz ${voiceName}` : `Ouvir amostra da voz ${voiceName}`}
      title={isPlaying ? "Pausar amostra" : "Ouvir amostra"}
      className="relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-wash hover:bg-wash-hover active:scale-95 transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setBroken(true)}
      />
      <Icon
        name={isPlaying ? "pause" : "play"}
        size={14}
        strokeWidth={2.3}
        className="text-ink-heading"
      />
    </button>
  );
}
