import type { Route } from "./+types/home";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { Icon } from "~/components/ui/Icon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard — LinkPix" },
    { name: "description", content: "Bem-vindo ao painel administrativo LinkPix" },
  ];
}

export default function Home() {
  const stats = {
    donationsToday: "R$ 0,00",
    averageDonation: "R$ 0,00",
    pageViews: "0",
  };

  const secondaryRows = [
    {
      label: "Média por doação",
      value: stats.averageDonation,
      icon: "graph" as const,
    },
    {
      label: "Visualizações da página",
      value: stats.pageViews,
      icon: "eye" as const,
    },
  ];

  return (
    <div>
      {/* Title block */}
      <PageHeader
        title="Dashboard"
        subtitle={
          <>
            Hoje você recebeu{" "}
            <span className="font-bold text-ink-heading">{stats.donationsToday}</span> em
            doações.
          </>
        }
      />

      {/* Primary + secondary columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Summary card */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="h-full rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-3">
              Doações recebidas (hoje)
            </span>
            <span className="text-[26px] leading-tight font-extrabold tracking-tight text-ink-heading">
              {stats.donationsToday}
            </span>

            <div className="mt-auto pt-4 divide-y divide-line">
              {secondaryRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 py-2.5 first:pt-1 last:pb-0"
                >
                  <span className="w-8 h-8 rounded-[12px] bg-tile flex items-center justify-center text-chrome-icon shrink-0">
                    <Icon name={row.icon} size={16} strokeWidth={2} />
                  </span>
                  <span className="text-[13px] font-medium text-ink-secondary">
                    {row.label}
                  </span>
                  <span className="ml-auto text-sm font-semibold text-ink-body">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity card */}
        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="h-full rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-3">
              Atividade recente
            </span>

            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <p className="text-lg font-extrabold tracking-tight text-ink-heading">
                Tudo tranquilo
              </p>
              <p className="text-sm text-ink-secondary mt-1">
                Sem movimentações registradas nas últimas 24 horas.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
