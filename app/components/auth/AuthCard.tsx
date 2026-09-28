import type { ReactNode } from "react";
import { LogoTile } from "~/components/ui/LogoTile";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[420px] bg-card border border-line rounded-[26px] shadow-xs p-6 sm:p-8 animate-scale-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoTile variant="auto" className="mb-5" imgClassName="h-8" textClassName="text-[22px]" />
          <h1 className="text-lg font-extrabold tracking-tight text-ink-heading">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-medium text-ink-secondary mt-1">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
