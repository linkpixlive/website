import type { ReactNode } from "react";

interface BadgeProps {
  status: "pending" | "success" | "failed" | string;
  children?: ReactNode;
}

const statusMap: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendente",
    className: "text-on-pending bg-pending",
  },
  processing: {
    label: "Processando",
    className: "text-info bg-info/10",
  },
  success: {
    label: "Concluído",
    className: "text-success bg-success/10",
  },
  approved: {
    label: "Aprovado",
    className: "text-success bg-success/10",
  },
  failed: {
    label: "Falhou",
    className: "text-error bg-error/10",
  },
  rejected: {
    label: "Rejeitado",
    className: "text-error bg-error/10",
  },
};

export function Badge({ status, children }: BadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config = statusMap[normalizedStatus] || {
    label: status,
    className: "text-ink-secondary bg-wash",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${config.className}`}
    >
      {children || config.label}
    </span>
  );
}
