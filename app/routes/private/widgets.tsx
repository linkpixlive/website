import { PageHeader } from "~/components/dashboard/PageHeader";

export default function Widgets() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Widgets"
        subtitle="Gerencie e personalize seus widgets para transmissões"
      />
      <div className="bg-surface border border-border p-6 rounded-2xl">
        <p className="text-text-secondary text-sm">
          Seção de widgets em desenvolvimento. Em breve você poderá criar e configurar seus alertas e overlays aqui.
        </p>
      </div>
    </div>
  );
}
