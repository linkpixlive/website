import { Clock, Eye, EyeOff, Lock, Wallet } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "../ui/Skeleton";

interface BalanceCardProps {
  label: string;
  amount: number;
  variant: "available" | "pending" | "blocked";
  loading?: boolean;
}

const iconMap = {
  available: Wallet,
  pending: Clock,
  blocked: Lock,
};

const variantStyles = {
  available: {
    textColor: "text-text-heading",
    iconColor: "text-primary",
    bgColor: "bg-surface",
  },
  pending: {
    textColor: "text-warning",
    iconColor: "text-warning",
    bgColor: "bg-surface border border-warning/10",
  },
  blocked: {
    textColor: "text-text-secondary",
    iconColor: "text-text-muted",
    bgColor: "bg-surface border border-border",
  },
};

export function BalanceCard({ label, amount, variant, loading = false }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(false);
  const Icon = iconMap[variant];
  const styles = variantStyles[variant];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className={`p-6 rounded-2xl flex flex-col justify-between h-32 ${styles.bgColor}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <Icon className={`h-5 w-5 ${styles.iconColor}`} />
      </div>
      <div className="flex items-center justify-between">
        {loading ? (
          <Skeleton className="h-8 w-36" />
        ) : (
          <span className={`text-2xl font-bold tracking-tight ${styles.textColor} ${!showBalance ? "blur-sm" : ""}`}>
            {formatCurrency(amount)}
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowBalance((v) => !v)}
          className="p-1 rounded text-text-muted hover:text-text-heading transition-colors duration-150 cursor-pointer outline-none shrink-0"
          title={showBalance ? "Ocultar" : "Mostrar"}
        >
          {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
