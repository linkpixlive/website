import { useRef, useState } from "react";
import { Icon } from "~/components/ui/Icon";
import { useToast } from "~/components/ui/useToast";
import { useExclusiveAudio } from "~/hooks/useExclusiveAudio";

interface AudioPlayerProps {
  src: string;
  downloadName?: string;
  getDownloadBlob?: () => Promise<Blob>;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function AudioPlayer({
  src,
  downloadName,
  getDownloadBlob,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const pauseAll = useExclusiveAudio(audioRef);

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;
    if (isPlaying) {
      audio.pause();
      return;
    }
    pauseAll();
    audio.play().catch(() => setHasError(true));
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = getDownloadBlob
        ? await getDownloadBlob()
        : await fetch(src).then((res) => {
            if (!res.ok) throw new Error("download failed");
            return res.blob();
          });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName ?? "audio.mp3";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Nunca navega para fora da página: apenas informa a falha.
      toast("Não foi possível baixar o áudio. Tente novamente.", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (hasError) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-card border border-line px-4 py-3">
        <Icon
          name="danger-circle"
          size={16}
          strokeWidth={2}
          className="text-ink-muted shrink-0"
        />
        <span className="text-xs font-medium text-ink-muted">
          Áudio indisponível
        </span>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-card border border-line px-2.5 py-2">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onError={() => {
          setHasError(true);
          setIsPlaying(false);
        }}
      />
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-inverse text-white hover:bg-inverse-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <Icon
          name={isPlaying ? "pause" : "play"}
          size={16}
          strokeWidth={2.3}
          className={isPlaying ? undefined : "translate-x-px"}
        />
      </button>
      <span className="text-[11px] font-semibold text-ink-label tabular-nums whitespace-nowrap">
        {formatTime(currentTime)}
      </span>
      <input
        type="range"
        min={0}
        max={duration > 0 ? duration : 0}
        step={0.1}
        value={duration > 0 ? Math.min(currentTime, duration) : 0}
        onChange={(e) => handleSeek(Number(e.currentTarget.value))}
        aria-label="Posição do áudio"
        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand/40
          [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink-heading
          [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink-heading"
        style={{
          background: `linear-gradient(to right, var(--color-ink-body-strong) ${progress}%, var(--color-line) ${progress}%)`,
        }}
      />
      <span className="text-[11px] font-semibold text-ink-label tabular-nums whitespace-nowrap">
        {formatTime(duration)}
      </span>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        title="Baixar áudio"
        aria-label={downloading ? "Baixando áudio" : "Baixar áudio"}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wash text-ink-body hover:bg-wash-hover transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {downloading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
        ) : (
          <Icon name="download-minimalistic" size={16} strokeWidth={2} />
        )}
      </button>
    </div>
  );
}
