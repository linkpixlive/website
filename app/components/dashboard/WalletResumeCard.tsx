import { useState } from "react";
import { Link } from "react-router";
import type { Withdrawal } from "~/api/modules/withdrawals";
import { Icon } from "~/components/ui/Icon";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatCurrency } from "./format";

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
    <div className="h-full rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
          Carteira
        </span>
        <button
          type="button"
          onClick={() => setShowValues((v) => !v)}
          className="p-1 rounded-full text-chrome-icon hover:bg-wash transition-colors duration-150 cursor-pointer outline-none active:scale-95 shrink-0"
          title={showValues ? "Ocultar valores" : "Mostrar valores"}
          aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
        >
          <Icon name={showValues ? "eye-closed" : "eye"} size={18} strokeWidth={1.9} />
        </button>
      </div>

      {loading || !balances ? (
        <Skeleton className="h-9 w-40 rounded-xl" />
      ) : (
        <span
          className={`text-[26px] leading-tight font-extrabold tracking-tight text-ink-heading ${
            !showValues ? "blur-sm select-none" : ""
          }`}
        >
          {formatCurrency(balances.available)}
        </span>
      )}
      <p className="mt-1 text-xs font-medium text-ink-muted">
        {loading || !balances ? (
          <Skeleton className="h-4 w-32 rounded-md" />
        ) : (
          <>Pendente {formatCurrency(balances.pending)} · pronto para saque</>
        )}
      </p>

      <div className="mt-auto pt-4">
        {lastWithdrawal && (
          <p className="text-[13px] font-medium text-ink-secondary leading-snug">
            Último saque:{" "}
            <strong className="font-bold text-ink-heading">
              {formatCurrency(lastWithdrawal.netAmount ?? lastWithdrawal.amount)}
            </strong>{" "}
            {withdrawalLabel(lastWithdrawal.status)}
          </p>
        )}
        <Link
          to="/carteira"
          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-wash px-4 h-10 w-full text-xs font-bold text-ink-body transition-all duration-150 outline-none hover:bg-[#e2e5ec] active:scale-[0.98]"
        >
          <Icon name="wallet" size={16} strokeWidth={2} />
          Abrir carteira
        </Link>
      </div>
    </div>
  );
}
