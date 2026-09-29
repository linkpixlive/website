import type { ReactNode } from "react";
import { Button } from "~/components/ui/Button";
import { Icon, type IconName } from "~/components/ui/Icon";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { cn } from "~/util/cn";
import type { AccountSettings } from "~/api/modules/account-settings";

export function TwoFactorBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
        enabled
          ? "bg-success/10 text-success"
          : "bg-wash text-ink-secondary border border-line-input"
      }`}
    >
      {enabled ? "Ativa" : "Inativa"}
    </span>
  );
}

export function SettingRow({
  icon,
  title,
  description,
  trailing,
  onClick,
  disabled,
}: {
  icon: IconName;
  title: string;
  description?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left hover:bg-wash transition-colors duration-150 cursor-pointer outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        <section aria-label="Segurança" className={cn(CARD_CLASS, "lg:col-span-12")}>
          <h2 className={cn(SECTION_HEADING_CLASS, "mb-2")}>Segurança</h2>

          <ul className="space-y-0.5">
            <SettingRow
              icon="lock"
              title="Alterar senha"
              description="Recomendamos senhas fortes e únicas"
              onClick={onChangePassword}
              trailing={
                <Icon name="alt-arrow-right" size={16} strokeWidth={1.9} className="text-ink-label shrink-0" />
              }
            />
            <SettingRow
              icon="letter"
              title="E-mail"
              description={settings?.email || "Carregando..."}
              onClick={onChangeEmail}
              trailing={
                <Icon name="alt-arrow-right" size={16} strokeWidth={1.9} className="text-ink-label shrink-0" />
              }
            />
            <SettingRow
              icon="key-minimalistic-square"
              title="Autenticação em dois fatores"
              description="Proteção extra no login"
              onClick={onToggleTwoFactor}
              trailing={<TwoFactorBadge enabled={has2fa} />}
            />
          </ul>
        </section>

        <section aria-label="Zona de risco" className={cn(CARD_CLASS, "lg:col-span-12")}>
          <div className="rounded-[20px] border border-error/30 bg-error/[0.06] p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-error">
              <Icon name="danger-circle" size={16} strokeWidth={2} />
              Zona de risco
            </h2>
            <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-ink-secondary">
              Ao desativar a conta, seus widgets e links deixam de funcionar e
              todas as sessões são encerradas. É possível{" "}
              <strong className="font-bold text-error">reativar</strong> fazendo
              login novamente.
            </p>
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
          </div>
        </section>
      </div>
    </div>
  );
}
