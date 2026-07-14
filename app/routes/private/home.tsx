import type { Route } from "./+types/home";
import { PageHeader } from "~/components/dashboard/PageHeader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard — LinkPix" },
    { name: "description", content: "Bem-vindo ao painel administrativo LinkPix" },
  ];
}

export default function Home() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Monitore suas doações e métricas em tempo real"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between h-32">
          <span className="text-sm font-medium text-text-secondary">Doações Recebidas (Hoje)</span>
          <span className="text-2xl font-bold text-text-heading">R$ 0,00</span>
        </div>
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between h-32">
          <span className="text-sm font-medium text-text-secondary">Média por Doação</span>
          <span className="text-2xl font-bold text-text-heading">R$ 0,00</span>
        </div>
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between h-32">
          <span className="text-sm font-medium text-text-secondary">Visualizações da Página</span>
          <span className="text-2xl font-bold text-text-heading">0</span>
        </div>
      </div>

      <div className="bg-surface border border-border p-6 rounded-2xl">
        <h3 className="text-base font-semibold text-text-heading mb-4">Atividade recente</h3>
        <p className="text-text-secondary text-sm">
          Sem movimentações registradas nas últimas 24 horas.
        </p>
      </div>
    </div>
  );
}
