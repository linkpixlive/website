import type { ReactNode } from "react";

interface BadgeProps {
  status: "pending" | "success" | "failed" | string;
  children?: ReactNode;
}

const statusMap: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendente",
    className: "text-warning bg-warning/10 border-warning/20",
  },
  success: {
    label: "Aprovado",
    className: "text-success bg-success/10 border-success/20",
  },
  failed: {
    label: "Rejeitado",
    className: "text-error bg-error/10 border-error/20",
  },
};

export function Badge({ status, children }: BadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config = statusMap[normalizedStatus] || {
    label: status,
    className: "text-text-secondary bg-surface-hover border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {children || config.label}
    </span>
  );
}
