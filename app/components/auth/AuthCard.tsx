import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-105 bg-surface border border-border rounded-2xl p-6 md:p-8 animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo.svg"
            alt="LinkPix Logo"
            className="h-10 mb-6 object-contain"
          />
          <h1 className="text-text-heading text-2xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
