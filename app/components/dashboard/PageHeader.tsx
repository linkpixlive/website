import type { ReactNode } from "react";

import { HeaderActions } from "./HeaderActions";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight leading-tight text-ink-heading">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-ink-secondary leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {actions}
        <HeaderActions />
      </div>
    </div>
  );
}
