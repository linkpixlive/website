import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";
import { Skeleton } from "~/components/ui/Skeleton";
import { popupClasses } from "~/components/ui/header-styles";
import { EyeToggleButton } from "~/components/ui/EyeToggleButton";
import { CARD_CLASS, ICON_TILE_CLASS, SECTION_HEADING_CLASS, STAT_NUMBER_CLASS } from "~/components/ui/classes";
import { HiddenValue } from "~/components/ui/HiddenValue";
import { formatBRLReais } from "~/util/currency";

interface BalanceCardProps {
  balances: {
    available: number;
    pending: number;
    blocked: number;
  };
  loading?: boolean;
  onWithdraw?: () => void;
}

export function BalanceCard({ balances, loading = false, onWithdraw }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(false);

  const secondaryRows = [
    {
      key: "pending",
      label: "Pendente",
      value: balances.pending,
      icon: "clock-circle" as const,
      hint: "Saldo em trânsito: saques solicitados ainda não confirmados ou valores aguardando compensação. Não está disponível para novo saque.",
    },
    {
      key: "blocked",
      label: "Bloqueado",
      value: balances.blocked,
      icon: "lock" as const,
      hint: "Valor retido temporariamente para análise antifraude ou verificação de segurança. Se persistir, fale com o suporte.",
    },
  ];

  return (
    <div className={`h-full ${CARD_CLASS} flex flex-col`}>
      <div className="flex items-center justify-between mb-3">
        <span className={SECTION_HEADING_CLASS}>
          Saldo disponível
        </span>
        <EyeToggleButton
          visible={showBalance}
          onToggle={() => setShowBalance((v) => !v)}
          iconSize={18}
          showLabel="Mostrar valores"
          hideLabel="Ocultar valores"
        />
      </div>

      {loading ? (
        <Skeleton className="h-8 w-40 rounded-xl" />
      ) : (
        <HiddenValue visible={showBalance} className={STAT_NUMBER_CLASS}>
          {formatBRLReais(balances.available)}
        </HiddenValue>
      )}

      <div className="mt-auto pt-4">
        <div className="divide-y divide-line">
          {secondaryRows.map((row) => (
            <div key={row.key} className="flex items-center gap-3 py-2.5 first:pt-1 last:pb-0">
              <span className={ICON_TILE_CLASS}>
                <Icon name={row.icon} size={16} strokeWidth={2} />
              </span>
              <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-secondary">
                {row.label}
                <Popover.Root>
                  <Popover.Trigger
                    aria-label={`O que significa saldo ${row.label.toLowerCase()}?`}
                    title={`O que significa saldo ${row.label.toLowerCase()}?`}
                    className="p-0.5 rounded-full text-ink-label hover:text-ink-heading transition-colors duration-150 cursor-pointer outline-none shrink-0"
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
              </span>
              {loading ? (
                <Skeleton className="h-4 w-20 ml-auto" />
              ) : (
                <HiddenValue
                  visible={showBalance}
                  className="ml-auto text-sm font-semibold text-ink-body"
                >
                  {formatBRLReais(row.value)}
                </HiddenValue>
              )}
            </div>
          ))}
        </div>

        <Button variant="primary" onClick={onWithdraw} className="w-full mt-4">
          Solicitar Saque
        </Button>
      </div>
    </div>
  );
}
