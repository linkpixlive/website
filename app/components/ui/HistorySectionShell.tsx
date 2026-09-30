import type { ReactNode } from "react";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "./classes";
import { cn } from "~/util/cn";

interface HistorySectionShellProps {
  title: string;
  /** Total exibido como "N registro(s)"; omitido quando 0. */
  total: number;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Card padrão das seções de histórico (título + contador + conteúdo + rodapé). */
export function HistorySectionShell({
  title,
  total,
  ariaLabel,
  className,
  children,
  footer,
}: HistorySectionShellProps) {
  return (
    <section aria-label={ariaLabel} className={cn(CARD_CLASS, className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={SECTION_HEADING_CLASS}>{title}</h2>
        {total > 0 && (
          <span className="text-[11px] font-semibold text-ink-label">
            {total} {total === 1 ? "registro" : "registros"}
          </span>
        )}
      </div>

      {children}

      {footer}
    </section>
  );
}
