import { useState } from "react";
import { Link } from "react-router";
import type { Withdrawal } from "~/api/modules/withdrawals";
import { Icon } from "~/components/ui/Icon";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatBRLReais } from "~/util/currency";
import { EyeToggleButton } from "~/components/ui/EyeToggleButton";
import { CARD_CLASS, SECTION_HEADING_CLASS, STAT_NUMBER_CLASS } from "~/components/ui/classes";
import { HiddenValue } from "~/components/ui/HiddenValue";

interface WalletResumeCardProps {
  balances: { available: number; pending: number; blocked: number } | null;
  lastWithdrawal: Withdrawal | null;
  loading?: boolean;
}

function withdrawalLabel(status: string) {
  if (status === "success") return "confirmado";
  if (status === "pending") return "pendente";
  if (status === "processing") return "em processamento";
  if (status === "failed") return "falhou";
  return status;
}

export function WalletResumeCard({ balances, lastWithdrawal, loading = false }: WalletResumeCardProps) {
  const [showValues, setShowValues] = useState(false);

  return (
    <div className={`h-full ${CARD_CLASS} flex flex-col`}>
      <div className="flex items-center justify-between mb-3">
        <span className={SECTION_HEADING_CLASS}>
          Carteira
        </span>
        <EyeToggleButton
          visible={showValues}
          onToggle={() => setShowValues((v) => !v)}
          iconSize={18}
          showLabel="Mostrar valores"
          hideLabel="Ocultar valores"
        />
      </div>

      {loading || !balances ? (
        <Skeleton className="h-9 w-40 rounded-xl" />
      ) : (
        <HiddenValue visible={showValues} className={STAT_NUMBER_CLASS}>
          {formatBRLReais(balances.available)}
        </HiddenValue>
      )}
      <p className="mt-1 text-xs font-medium text-ink-muted">
        {loading || !balances ? (
          <Skeleton className="h-4 w-32 rounded-full" />
        ) : (
          <HiddenValue visible={showValues}>
            <>Pendente {formatBRLReais(balances.pending)} · pronto para saque</>
          </HiddenValue>
        )}
      </p>

      <div className="mt-auto pt-4">
        {lastWithdrawal && (
          <p className="text-[13px] font-medium text-ink-secondary leading-snug">
            Último saque:{" "}
            <strong className="font-bold text-ink-heading">
              {formatBRLReais(lastWithdrawal.netAmount ?? lastWithdrawal.amount)}
            </strong>{" "}
            {withdrawalLabel(lastWithdrawal.status)}
          </p>
        )}
        <Link
          to="/carteira"
          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-wash px-4 h-10 w-full text-xs font-bold text-ink-body transition-all duration-150 outline-none hover:bg-wash-hover active:scale-[0.98]"
        >
          <Icon name="wallet" size={16} strokeWidth={2} />
          Abrir carteira
        </Link>
      </div>
    </div>
  );
}
