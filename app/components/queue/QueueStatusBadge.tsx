import { Wifi, WifiOff, Play, Pause } from "lucide-react";

interface QueueStatusBadgeProps {
  isOverlayOnline: boolean;
  isPaused: boolean;
}

export function QueueStatusBadge({ isOverlayOnline, isPaused }: QueueStatusBadgeProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1.5 text-sm font-medium">
        {isOverlayOnline ? (
          <Wifi className="h-4 w-4 text-success" />
        ) : (
          <WifiOff className="h-4 w-4 text-error" />
        )}
        <span className={isOverlayOnline ? "text-success" : "text-error"}>
          {isOverlayOnline ? "Online" : "Offline"}
        </span>
      </span>
      <span className="flex items-center gap-1.5 text-sm font-medium">
        {isPaused ? (
          <Pause className="h-4 w-4 text-warning" />
        ) : (
          <Play className="h-4 w-4 text-success" />
        )}
        <span className={isPaused ? "text-warning" : "text-success"}>
          {isPaused ? "Pausado" : "Ativo"}
        </span>
      </span>
    </div>
  );
}
