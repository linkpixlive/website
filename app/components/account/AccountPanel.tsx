import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { LINK_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import type { AccountSettings } from "~/api/modules/account-settings";

export function AccountPanel({
  settings,
  onChangePassword,
  onChangeEmail,
  onToggleTwoFactor,
  onDeactivate,
}: {
  settings?: AccountSettings;
  onChangePassword: () => void;
  onChangeEmail: () => void;
  onToggleTwoFactor: () => void;
  onDeactivate: () => void;
}) {
  const has2fa = settings?.has2fa ?? false;
  const email = settings?.email || "Carregando...";
  const verified = settings?.verifiedEmail ?? false;

  return (
    <div>
      <section
        aria-label="Autenticação em dois fatores"
        className="rounded-[28px] bg-hero border border-line text-on-hero p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-hero/60">
              Segunda camada
            </p>
            <p className="mt-2 text-2xl sm:text-[28px] font-extrabold tracking-tight leading-tight">
              {has2fa ? "Proteção extra ativa" : "Proteção extra desligada"}
            </p>
            <p className="mt-2 max-w-md text-[13px] font-medium leading-relaxed text-on-hero/70">
              {has2fa
                ? "Pedimos um código do seu app a cada login. É o que protege seus saques."
                : "Ao ativar, toda ação crítica exigirá um código do seu app autenticador."}
            </p>
          </div>
          <div className="flex flex-row items-center gap-3 md:flex-col md:items-end">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                has2fa
                  ? "bg-on-hero text-hero"
                  : "bg-error-solid text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-current"
              />
              {has2fa ? "Ativa" : "Inativa"}
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onToggleTwoFactor}
              className="px-6"
            >
              {has2fa ? "Gerenciar" : "Ativar proteção"}
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Credenciais" className="mt-10">
        <h2 className={SECTION_HEADING_CLASS}>Credenciais</h2>
        <dl className="mt-2 divide-y divide-line/60 border-y border-line/60">
          <div className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-ink-muted">E-mail</dt>
              <dd className="mt-0.5 truncate text-[15px] font-bold tracking-tight text-ink-heading">
                {email}{" "}
                <span
                  className={`ml-1 text-xs font-bold ${verified ? "text-success" : "text-warning"}`}
                >
                  · {verified ? "Verificado" : "Pendente"}
                </span>
              </dd>
            </div>
            <button
              type="button"
              onClick={onChangeEmail}
              className={`${LINK_CLASS} shrink-0 self-start text-sm font-bold sm:self-auto cursor-pointer`}
            >
              Alterar
            </button>
          </div>
          <div className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-ink-muted">Senha</dt>
              <dd className="mt-0.5 text-[15px] font-bold tracking-tight text-ink-heading">
                ••••••••
              </dd>
            </div>
            <button
              type="button"
              onClick={onChangePassword}
              className={`${LINK_CLASS} shrink-0 self-start text-sm font-bold sm:self-auto cursor-pointer`}
            >
              Alterar
            </button>
          </div>
        </dl>
      </section>

      <section
        aria-label="Zona de risco"
        className="mt-10 rounded-[28px] border border-error/30 bg-error/[0.06] p-5 sm:p-6"
      >
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-error">
          <Icon name="danger-circle" size={16} strokeWidth={2} />
          Zona de risco
        </h2>
        <ul className="mt-2 max-w-md list-disc space-y-1 pl-5 text-xs font-medium leading-relaxed text-ink-secondary">
          <li>Widgets e links param de funcionar.</li>
          <li>Todas as sessões são encerradas.</li>
          <li>Reativação fazendo login novamente.</li>
        </ul>
        <div className="mt-4">
          <Button
            variant="danger-soft"
            size="sm"
            type="button"
            onClick={onDeactivate}
          >
            Desativar conta
          </Button>
        </div>
      </section>
    </div>
  );
}
