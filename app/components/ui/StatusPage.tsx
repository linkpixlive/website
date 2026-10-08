import { Button } from "./Button";
import { LINK_CLASS } from "./classes";

export type StatusTone = "neutral" | "reconnect" | "failure";

interface StatusPageProps {
  eyebrow: string;
  tone: StatusTone;
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  reassurance?: string;
}

const eyebrowStyles: Record<StatusTone, string> = {
  neutral: "text-ink-label",
  reconnect: "text-info",
  failure: "text-error",
};

export function StatusPage({
  eyebrow,
  tone,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  reassurance,
}: StatusPageProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-14">
      <p
        className={`text-[11px] font-extrabold uppercase tracking-[0.12em] ${eyebrowStyles[tone]}`}
      >
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance text-ink-heading sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">{body}</p>
      <div className="mt-7 flex flex-col items-stretch gap-3 sm:items-start">
        <Button type="button" onClick={onPrimary} className="min-h-12 w-full sm:w-auto">
          {primaryLabel}
        </Button>
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className={`${LINK_CLASS} self-center text-sm font-semibold sm:self-start`}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
      {reassurance && (
        <>
          <hr className="my-7 border-line" />
          <p className="text-[13px] leading-relaxed text-ink-muted">
            LinkPix · {reassurance}
          </p>
        </>
      )}
    </div>
  );
}
