import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import type { WalletBalances } from "~/api/modules/wallets";
import { Button } from "~/components/ui/Button";
import { EyeToggleButton } from "~/components/ui/EyeToggleButton";
import { Skeleton } from "~/components/ui/Skeleton";
import { Icon } from "~/components/ui/Icon";
import { popupClasses } from "~/components/ui/header-styles";
import { formatBRLReais } from "~/util/currency";
import { MIN_WITHDRAWAL_AMOUNT } from "~/validators/wallet-validator";

interface WalletHeroProps {
  balances: WalletBalances;
  loading?: boolean;
  onWithdraw: () => void;
  onManageKeys: () => void;
}

export function WalletHero({ balances, loading = false, onWithdraw, onManageKeys }: WalletHeroProps) {
  const [showValues, setShowValues] = useState(false);

  const total = balances.available + balances.pending + balances.blocked;
  const availPct = total > 0 ? (balances.available / total) * 100 : 0;
  const pendPct = total > 0 ? (balances.pending / total) * 100 : 0;
  const blockedPct = total > 0 ? (balances.blocked / total) * 100 : 0;

  const display = (value: number) => (showValues ? formatBRLReais(value) : "R$ ••••");

  const secondaryRows = [
    {
      key: "pending",
      label: "Pendente",
      value: balances.pending,
      hint: "Saldo em trânsito: saques solicitados ainda não confirmados ou valores aguardando compensação. Não está disponível para novo saque.",
    },
    {
      key: "blocked",
      label: "Bloqueado",
      value: balances.blocked,
      hint: "Valor retido temporariamente para análise antifraude ou verificação de segurança. Se persistir, fale com o suporte.",
    },
  ];

  return (
    <section aria-label="Saldo">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-muted">
              Saldo disponível
            </p>
            <EyeToggleButton
              visible={showValues}
              onToggle={() => setShowValues((v) => !v)}
              showLabel="Mostrar valores"
              hideLabel="Ocultar valores"
            />
          </div>
          {loading ? (
            <Skeleton className="mt-3 h-14 w-64 rounded-2xl sm:h-16" />
          ) : (
            <p
              aria-live="polite"
              className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums text-ink-heading sm:text-6xl"
            >
              {display(balances.available)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-[13px]">
            {secondaryRows.map((row) => (
              <p key={row.key} className="text-ink-secondary">
                <span className="inline-flex items-center gap-1">
                  {row.label}
                  <Popover.Root>
                    <Popover.Trigger
                      aria-label={`O que significa saldo ${row.label.toLowerCase()}?`}
                      title={`O que significa saldo ${row.label.toLowerCase()}?`}
                      className="cursor-pointer rounded-full p-0.5 text-ink-muted outline-none transition-colors duration-150 hover:text-ink-heading"
                    >
                      <Icon name="info-circle" size={14} strokeWidth={1.9} />
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Positioner
                        side="top"
                        align="start"
                        sideOffset={8}
                        className="z-50"
                      >
                        <Popover.Popup className={`max-w-60 p-3 ${popupClasses}`}>
                          <p className="text-xs font-medium leading-relaxed text-ink-secondary">
                            {row.hint}
                          </p>
                        </Popover.Popup>
                      </Popover.Positioner>
                    </Popover.Portal>
                  </Popover.Root>
                </span>{" "}
                <strong className="font-bold text-ink-heading tabular-nums">
                  {loading ? "R$ ••••" : display(row.value)}
                </strong>
              </p>
            ))}
          </div>
          <div
            className="mt-4 flex h-1 w-full max-w-md overflow-hidden rounded-full bg-line"
            aria-hidden="true"
          >
            <span className="h-full rounded-full bg-success" style={{ width: `${availPct}%` }} />
            <span className="h-full bg-pending" style={{ width: `${pendPct}%` }} />
            <span className="h-full bg-ink-muted/50" style={{ width: `${blockedPct}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end md:pb-1">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center md:justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={onManageKeys}
              className="w-full sm:w-auto"
            >
              Gerenciar chaves Pix
            </Button>
            <Button
              variant="primary"
              onClick={onWithdraw}
              className="w-full px-7 py-3.5 text-sm sm:w-auto"
            >
              Solicitar saque
            </Button>
          </div>
          <p className="text-[12px] font-medium text-ink-secondary md:text-right">
            Mínimo {formatBRLReais(MIN_WITHDRAWAL_AMOUNT)} · cai em até 1 dia útil
          </p>
        </div>
      </div>
    </section>
  );
}
