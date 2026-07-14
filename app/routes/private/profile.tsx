import { PageHeader } from "~/components/dashboard/PageHeader";

export default function Profile() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Perfil"
        subtitle="Gerencie suas informações de perfil do streamer"
      />
      <div className="bg-surface border border-border p-6 rounded-2xl">
        <p className="text-text-secondary text-sm">
          Seção de perfil em desenvolvimento. Em breve você poderá editar seus dados públicos e links de doações.
        </p>
      </div>
    </div>
  );
}
