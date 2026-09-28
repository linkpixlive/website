import { Outlet } from "react-router";
import { PageHeader } from "~/components/dashboard/PageHeader";
import type { Route } from "./+types/layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Conta — LinkPix" },
    {
      name: "description",
      content: "Gerencie sua conta e segurança em um só lugar",
    },
  ];
}

export default function ConfiguracoesLayout() {
  return (
    <div>
      <PageHeader
        title="Conta"
        subtitle="Gerencie sua conta e segurança em um só lugar."
      />

      <div className="mt-5">
        <Outlet />
      </div>
    </div>
  );
}
