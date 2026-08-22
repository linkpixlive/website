import type { ReactNode } from "react";
import type { Route } from "./+types/account";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { Button } from "~/components/ui/Button";
import { Icon, type IconName } from "~/components/ui/Icon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Conta — LinkPix" },
    { name: "description", content: "Configurações de segurança e preferências da sua conta" },
  ];
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ${
        on ? "bg-inverse" : "bg-wash border border-gray-200/90"
      }`}
    >
      <span
        className={`absolute h-3.5 w-3.5 rounded-full transition-all duration-150 ${
          on ? "left-[18px] bg-white" : "left-[3px] bg-ink-label"
        }`}
      />
    </span>
  );
}

function SettingRow({
  icon,
  title,
  description,
  trailing,
}: {
  icon: IconName;
  title: string;
  description?: string;
  trailing?: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left hover:bg-wash transition-colors duration-150 cursor-pointer outline-none"
      >
        <span className="w-9 h-9 rounded-lg bg-tile grid place-items-center shrink-0">
          <Icon name={icon} size={18} strokeWidth={1.9} className="text-chrome-icon" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-semibold text-ink-body leading-tight">
            {title}
          </span>
          {description && (
            <span className="block text-xs font-medium text-ink-muted mt-0.5">
              {description}
            </span>
          )}
        </span>
        {trailing}
      </button>
    </li>
  );
}

export default function Account() {
  return (
    <div>
      <PageHeader
        title="Conta"
        subtitle={
          <>
            Configurações de segurança e preferências da{" "}
            <strong className="font-bold text-ink-heading">sua conta</strong>.
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        <section
          aria-label="Segurança"
          className="rounded-[26px] bg-card border border-gray-100/70 shadow-xs p-5 lg:col-span-7 xl:col-span-8"
        >
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-2">
            Segurança
          </h2>

          <ul className="space-y-0.5">
            <SettingRow
              icon="lock"
              title="Alterar senha"
              description="Atualizada há 3 meses"
              trailing={
                <Icon name="alt-arrow-right" size={16} strokeWidth={1.9} className="text-ink-label shrink-0" />
              }
            />
            <SettingRow
              icon="key-minimalistic-square"
              title="Autenticação em dois fatores"
              description="Proteção extra no login"
              trailing={
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-success/10 text-emerald-700 shrink-0">
                  Ativa
                </span>
              }
            />
            <SettingRow
              icon="clock-circle"
              title="Sessões ativas"
              description="2 dispositivos conectados"
              trailing={
                <Icon name="alt-arrow-right" size={16} strokeWidth={1.9} className="text-ink-label shrink-0" />
              }
            />
          </ul>
        </section>

        <section
          aria-label="Preferências"
          className="rounded-[26px] bg-card border border-gray-100/70 shadow-xs p-5 lg:col-span-5 xl:col-span-4 flex flex-col"
        >
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-2">
            Preferências
          </h2>

          <ul className="space-y-0.5">
            <li className="flex items-center gap-3 rounded-xl px-3.5 py-2.5">
              <span className="w-9 h-9 rounded-lg bg-tile grid place-items-center shrink-0">
                <Icon name="tuning" size={18} strokeWidth={1.9} className="text-chrome-icon" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-ink-body leading-tight">
                  Alertas sonoros
                </span>
                <span className="block text-xs font-medium text-ink-muted mt-0.5">
                  Som ao receber doações
                </span>
              </span>
              <Switch on />
            </li>
            <li className="flex items-center gap-3 rounded-xl px-3.5 py-2.5">
              <span className="w-9 h-9 rounded-lg bg-tile grid place-items-center shrink-0">
                <Icon
                  name="settings-minimalistic"
                  size={18}
                  strokeWidth={1.9}
                  className="text-chrome-icon"
                />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-ink-body leading-tight">
                  Modo compacto
                </span>
                <span className="block text-xs font-medium text-ink-muted mt-0.5">
                  Listas mais densas
                </span>
              </span>
              <Switch on={false} />
            </li>
          </ul>
        </section>

        <section
          aria-label="Zona de risco"
          className="rounded-[26px] bg-card border border-gray-100/70 shadow-xs p-5 lg:col-span-12"
        >
          <div className="rounded-[20px] border border-[#ef4444]/30 p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-error">Zona de risco</h2>
            <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-ink-secondary">
              A exclusão da conta é permanente. Todos os seus widgets, links de doação e
              histórico serão apagados.
            </p>
            <div className="mt-4">
              <Button variant="danger" size="sm" type="button">
                Excluir conta
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
