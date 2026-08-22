interface QueueStatusBadgeProps {
  isOverlayOnline: boolean;
  isPaused: boolean;
}

const chipBase =
  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold";

export function QueueStatusBadge({
  isOverlayOnline,
  isPaused,
}: QueueStatusBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${chipBase} ${
          isOverlayOnline
            ? "bg-success/10 text-emerald-700"
            : "bg-error/10 text-error"
        }`}
      >
        <span
          aria-hidden="true"
          className={`w-1.5 h-1.5 rounded-full ${isOverlayOnline ? "bg-success" : "bg-error"}`}
        />
        {isOverlayOnline ? "Online" : "Offline"}
      </span>

      <span
        className={`${chipBase} ${
          isPaused
            ? "bg-warning/10 text-yellow-ink"
            : "bg-success/10 text-emerald-700"
        }`}
      >
        <span
          aria-hidden="true"
          className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-warning" : "bg-success"}`}
        />
        {isPaused ? "Pausado" : "Ativo"}
      </span>
    </div>
  );
}
