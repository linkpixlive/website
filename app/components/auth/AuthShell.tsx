import type { ReactNode } from "react";
import { Link } from "react-router";
import { LogoTile } from "~/components/ui/LogoTile";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  aside?: { to: string; label: string };
  children: ReactNode;
}

export function AuthShell({ eyebrow, title, lede, aside, children }: AuthShellProps) {
  return (
    <div className="m-auto flex w-full max-w-[420px] flex-col px-5 py-8 sm:py-10">
      <header className="flex items-center justify-between gap-4">
        <LogoTile href="/" variant="auto" />
        {aside && (
          <Link
            to={aside.to}
            className="shrink-0 text-[13px] font-semibold text-info transition-colors duration-150 hover:text-info-hover"
          >
            {aside.label}
          </Link>
        )}
      </header>

      <div className="mt-8">
        <p className={SECTION_HEADING_CLASS}>{eyebrow}</p>
        <h1 className="mt-2 text-[28px] leading-[1.15] font-extrabold tracking-tight text-ink-heading">
          {title}
        </h1>
        {lede && (
          <p className="mt-2 text-sm font-medium text-ink-secondary">{lede}</p>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
