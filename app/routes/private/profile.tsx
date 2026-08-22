import type { Route } from "./+types/profile";
import { Form } from "react-router";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { Button } from "~/components/ui/Button";
import { FormField } from "~/components/ui/FormField";
import { Icon } from "~/components/ui/Icon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Perfil — LinkPix" },
    { name: "description", content: "Gerencie suas informações de perfil do streamer" },
  ];
}

const stats = [
  { label: "Doações recebidas", value: "128" },
  { label: "Seguidores", value: "3.4k" },
  { label: "Widgets ativos", value: "2" },
];

const links = [
  { platform: "Pix copia e cola", url: "linkpix.app/@henriquesouza" },
  { platform: "Link direto", url: "linkpix.app/presente" },
];

export default function Profile() {
  return (
    <div>
      <PageHeader
        title="Perfil"
        subtitle={
          <>
            Gerencie suas informações públicas e{" "}
            <strong className="font-bold text-ink-heading">links de doação</strong>.
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        <section
          aria-label="Dados públicos"
          className="rounded-[26px] bg-card border border-gray-100/70 shadow-xs p-5 lg:col-span-7 xl:col-span-8 flex flex-col"
        >
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-4">
            Dados públicos
          </h2>

          <Form className="flex flex-col gap-4 flex-1" onSubmit={(e) => e.preventDefault()}>
            <FormField
              name="displayName"
              label="Nome do streamer"
              icon="user-circle"
              defaultValue="Henrique Souza"
            />
            <FormField
              name="pageUrl"
              label="URL da sua página"
              icon="link-minimalistic"
              defaultValue="linkpix.app/@henriquesouza"
            />
            <FormField
              name="thanksMessage"
              label="Mensagem de agradecimento"
              icon="pen-new-round"
              defaultValue="Obrigado pela doação! Você é demais!"
            />

            <div className="mt-auto pt-2 flex justify-end">
              <Button type="submit" size="sm">
                Salvar alterações
              </Button>
            </div>
          </Form>
        </section>

        <section
          aria-label="Identidade"
          className="rounded-[26px] bg-card border border-gray-100/70 shadow-xs p-5 lg:col-span-5 xl:col-span-4"
        >
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-4">
            Identidade
          </h2>

          <div className="rounded-2xl bg-wash p-4 flex items-center gap-3">
            <img
              src="/default-avatar.svg"
              alt="Avatar do streamer"
              className="h-14 w-14 rounded-full object-cover border border-white shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <p className="text-base font-bold text-ink-heading leading-tight truncate">
                Henrique Souza
              </p>
              <p className="text-xs font-medium text-ink-muted mt-0.5 truncate">
                @henriquesouza
              </p>
            </div>
          </div>

          <ul className="mt-4 divide-y divide-gray-100">
            {stats.map((stat) => (
              <li key={stat.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-[13px] font-medium text-ink-secondary">{stat.label}</span>
                <span className="text-sm font-extrabold text-ink-heading">{stat.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label="Links de doação"
          className="rounded-[26px] bg-card border border-gray-100/70 shadow-xs p-5 lg:col-span-12"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
              Links de doação
            </h2>
            <Button variant="inverse" size="sm" type="button">
              <Icon name="add-circle" size={16} strokeWidth={1.9} />
              Adicionar link
            </Button>
          </div>

          <ul className="divide-y divide-gray-100">
            {links.map((link) => (
              <li key={link.url} className="group flex items-center gap-3 py-3 first:pt-0">
                <span className="w-9 h-9 rounded-lg bg-tile grid place-items-center shrink-0">
                  <Icon name="link-minimalistic" size={18} strokeWidth={1.9} className="text-chrome-icon" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink-body leading-tight">
                    {link.platform}
                  </p>
                  <p className="text-xs font-medium text-ink-muted mt-0.5 truncate">{link.url}</p>
                </div>
                <Icon
                  name="alt-arrow-right"
                  size={16}
                  strokeWidth={1.9}
                  className="text-ink-label shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
