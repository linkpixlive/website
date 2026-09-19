import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";
import { Skeleton } from "~/components/ui/Skeleton";
import { popupClasses } from "~/components/dashboard/header-styles";

interface BalanceCardProps {
  balances: {
    available: number;
    pending: number;
    blocked: number;
  };
  loading?: boolean;
  onWithdraw?: () => void;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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
    <div className="h-full rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
          Saldo disponível
        </span>
        <button
          type="button"
          onClick={() => setShowBalance((v) => !v)}
          className="p-1 rounded-full text-chrome-icon hover:bg-wash transition-colors duration-150 cursor-pointer outline-none active:scale-95 shrink-0"
          title={showBalance ? "Ocultar valores" : "Mostrar valores"}
        >
          <Icon name={showBalance ? "eye-closed" : "eye"} size={18} strokeWidth={1.9} />
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-8 w-40 rounded-xl" />
      ) : (
        <span
          className={`text-[26px] leading-tight font-extrabold tracking-tight text-ink-heading ${
            !showBalance ? "blur-sm select-none" : ""
          }`}
        >
          {formatCurrency(balances.available)}
        </span>
      )}

      <div className="mt-auto pt-4">
        <div className="divide-y divide-line">
          {secondaryRows.map((row) => (
            <div key={row.key} className="flex items-center gap-3 py-2.5 first:pt-1 last:pb-0">
              <span className="w-8 h-8 rounded-[12px] bg-tile flex items-center justify-center text-chrome-icon shrink-0">
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
                <span
                  className={`ml-auto text-sm font-semibold text-ink-body ${
                    !showBalance ? "blur-sm select-none" : ""
                  }`}
                >
                  {formatCurrency(row.value)}
                </span>
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
