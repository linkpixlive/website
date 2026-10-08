import type { ReactNode } from "react";
import { Icon } from "~/components/ui/Icon";

interface DonationsHeaderProps {
  isPaused: boolean;
  actions?: ReactNode;
}

export function DonationsHeader({ isPaused, actions }: DonationsHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-heading sm:text-2xl lg:text-[26px]">
          Doações
        </h1>
        <p className="mt-1.5 text-xs font-medium text-ink-secondary sm:text-sm">
          Visualize e gerencie suas mensagens recebidas.
        </p>
        {isPaused && (
          <p
            aria-live="polite"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-bold whitespace-nowrap text-yellow-ink"
          >
            <Icon name="pause" size={14} strokeWidth={2.5} />
            Fila pausada — retome para exibir os alertas
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
