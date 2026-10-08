import type { ReactNode } from "react";
import { AuthShell } from "./AuthShell";

interface AuthSplitProps {
  tone: "login" | "register";
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  aside?: { to: string; label: string };
  children: ReactNode;
}

const PANEL_COPY = {
  login: {
    eyebrow: "LinkPix para streamers",
    headline: "Suas doações, ao vivo.",
    sub: "Entre e acompanhe cada alerta, cada mensagem, cada Pix.",
  },
  register: {
    eyebrow: "Comece a receber hoje",
    headline: "Sua página em minutos.",
    sub: "Crie sua conta, conecte o Pix e receba na próxima live.",
  },
} as const;

function ArtPanel({ tone, compact }: { tone: "login" | "register"; compact?: boolean }) {
  const copy = PANEL_COPY[tone];
  return (
    <div className="relative h-full w-full overflow-hidden bg-hero">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(120% 90% at 15% 0%, rgba(91, 141, 239, 0.7) 0%, transparent 55%)",
            "radial-gradient(100% 80% at 85% 25%, rgba(174, 198, 232, 0.5) 0%, transparent 55%)",
            "radial-gradient(130% 100% at 50% 110%, rgba(43, 75, 122, 0.9) 0%, transparent 60%)",
            "radial-gradient(60% 45% at 70% 60%, rgba(174, 198, 232, 0.3) 0%, transparent 70%)",
          ].join(","),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60 blur-2xl"
        style={{
          background:
            "conic-gradient(from 200deg at 30% 40%, transparent 0deg, rgba(91, 141, 239, 0.35) 40deg, transparent 90deg, transparent 180deg, rgba(174, 198, 232, 0.25) 230deg, transparent 280deg)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"
      />

      <div className={`relative flex h-full flex-col ${compact ? "p-5" : "p-10 xl:p-12"}`}>
        <p className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-wider text-white/80">
          {copy.eyebrow}
          <span aria-hidden="true" className="h-px w-10 bg-white/40" />
        </p>
        <div className={compact ? "mt-auto pt-8" : "mt-auto"}>
          <h2
            className={`font-display font-semibold tracking-tight text-white ${
              compact ? "text-[28px] leading-[1.1]" : "text-[44px] leading-[1.05] xl:text-[52px]"
            }`}
          >
            {copy.headline}
          </h2>
          <p className={`mt-3 font-medium text-white/70 ${compact ? "text-[13px]" : "text-sm max-w-[36ch]"}`}>
            {copy.sub}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthSplit({ tone, eyebrow, title, lede, aside, children }: AuthSplitProps) {
  return (
    <div className="grid w-full flex-1 grid-cols-1 lg:grid-cols-2">
      <div className="h-64 sm:h-72 lg:hidden">
        <ArtPanel tone={tone} compact />
      </div>

      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        <ArtPanel tone={tone} />
      </aside>

      <div className="flex w-full min-w-0 items-center justify-center px-5 py-6 sm:px-10 sm:py-8">
        <AuthShell eyebrow={eyebrow} title={title} lede={lede} aside={aside}>
          {children}
        </AuthShell>
      </div>
    </div>
  );
}
