import { PageHeader } from "~/components/dashboard/PageHeader";

export default function Account() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Conta"
        subtitle="Configurações de segurança e preferências da sua conta"
      />
      <div className="bg-surface border border-border p-6 rounded-2xl">
        <p className="text-text-secondary text-sm">
          Seção de conta em desenvolvimento. Em breve você poderá alterar senhas, autenticação e preferências.
        </p>
      </div>
    </div>
  );
}
