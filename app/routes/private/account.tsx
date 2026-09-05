import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/account";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { Button } from "~/components/ui/Button";
import { Icon, type IconName } from "~/components/ui/Icon";
import { ChangePasswordModal } from "~/components/account/ChangePasswordModal";
import { ChangeEmailModal } from "~/components/account/ChangeEmailModal";
import { DeactivateAccountModal } from "~/components/account/DeactivateAccountModal";
import { TwoFactorModal } from "~/components/account/TwoFactorModal";
import {
  accountSettingsApi,
  type AccountSettings,
} from "~/api/modules/account-settings";
import { getAuthToken, clearAuthCookie } from "~/util/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Conta — LinkPix" },
    { name: "description", content: "Configurações de segurança e preferências da sua conta" },
  ];
}

const FALLBACK_SETTINGS: AccountSettings = {
  id: "",
  email: "",
  has2fa: false,
  active: true,
  usernameChangedAt: null,
};

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);

  let settings = FALLBACK_SETTINGS;
  try {
    const res = await accountSettingsApi.getSettings(token);
    if (res.success) settings = res.data;
  } catch (err) {
    console.error("Failed to load account settings:", err);
  }

  return { settings };
}

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent"));

  if (intent === "changePassword") {
    const res = await accountSettingsApi.changePassword(token, {
      currentPassword: String(formData.get("currentPassword")),
      newPassword: String(formData.get("newPassword")),
    });

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    return { success: true, action: intent, message: res.data.message };
  }

  if (intent === "changeEmail") {
    const email = String(formData.get("email"));
    const res = await accountSettingsApi.changeEmail(token, {
      email,
      password: String(formData.get("password")),
    });

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    // Every session was killed server-side; send the streamer straight to
    // the OTP flow for the new address and drop the stale cookie.
    throw redirect(
      `/auth/verify-email?email=${encodeURIComponent(email)}`,
      { headers: { "Set-Cookie": clearAuthCookie() } },
    );
  }

  if (intent === "2faSetup") {
    const res = await accountSettingsApi.setup2fa(token);

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    return {
      success: true,
      action: intent,
      data: { otpauthUrl: res.data.otpauthUrl, secret: res.data.secret },
    };
  }

  if (intent === "2faEnable") {
    const res = await accountSettingsApi.enable2fa(token, {
      token: String(formData.get("token")),
    });

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    return { success: true, action: intent, message: res.data.message };
  }

  if (intent === "2faDisable") {
    const res = await accountSettingsApi.disable2fa(token, {
      password: String(formData.get("password")),
    });

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    return { success: true, action: intent, message: res.data.message };
  }

  if (intent === "deactivate") {
    const res = await accountSettingsApi.deactivateAccount(token, {
      password: String(formData.get("password")),
    });

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    throw redirect("/auth/login", {
      headers: { "Set-Cookie": clearAuthCookie() },
    });
  }

  return null;
}

const PREFERENCES_STORAGE_KEY = "linkpix:account:preferences";

interface AccountPreferences {
  soundAlerts: boolean;
  compactMode: boolean;
}

const DEFAULT_PREFERENCES: AccountPreferences = {
  soundAlerts: true,
  compactMode: false,
};

function useAccountPreferences() {
  const [preferences, setPreferences] =
    useState<AccountPreferences>(DEFAULT_PREFERENCES);

  // Lazy read from localStorage keeps SSR markup stable.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (raw) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
      }
    } catch {
      // Corrupted storage falls back to defaults.
    }
  }, []);

  const togglePreference = (key: keyof AccountPreferences) => {
    setPreferences((current) => {
      const next = { ...current, [key]: !current[key] };
      try {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable (private mode): preference stays in-memory.
      }
      return next;
    });
  };

  return { preferences, togglePreference };
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ${
        on ? "bg-inverse" : "bg-wash border border-line-input"
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

function TwoFactorBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
        enabled
          ? "bg-success/10 text-emerald-700"
          : "bg-wash text-ink-secondary border border-line-input"
      }`}
    >
      {enabled ? "Ativa" : "Inativa"}
    </span>
  );
}

function SettingRow({
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

function Account({
  settings,
  preferences,
  onTogglePreference,
  onChangePassword,
  onChangeEmail,
  onToggleTwoFactor,
  onDeactivate,
}: {
  settings?: AccountSettings;
  preferences: AccountPreferences;
  onTogglePreference: (key: keyof AccountPreferences) => void;
  onChangePassword: () => void;
  onChangeEmail: () => void;
  onToggleTwoFactor: () => void;
  onDeactivate: () => void;
  }) {
  const has2fa = settings?.has2fa ?? false;

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
          className="rounded-[26px] bg-card border border-line shadow-xs p-5 lg:col-span-7 xl:col-span-8"
        >
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-2">
            Segurança
          </h2>

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

        <section
          aria-label="Preferências"
          className="rounded-[26px] bg-card border border-line shadow-xs p-5 lg:col-span-5 xl:col-span-4 flex flex-col"
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
              <button
                type="button"
                role="switch"
                aria-checked={preferences.soundAlerts}
                aria-label="Alertas sonoros"
                onClick={() => onTogglePreference("soundAlerts")}
                className="cursor-pointer outline-none"
              >
                <Switch on={preferences.soundAlerts} />
              </button>
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
              <button
                type="button"
                role="switch"
                aria-checked={preferences.compactMode}
                aria-label="Modo compacto"
                onClick={() => onTogglePreference("compactMode")}
                className="cursor-pointer outline-none"
              >
                <Switch on={preferences.compactMode} />
              </button>
            </li>
          </ul>
        </section>

        <section
          aria-label="Zona de risco"
          className="rounded-[26px] bg-card border border-line shadow-xs p-5 lg:col-span-12"
        >
          <div className="rounded-[20px] border border-[#ef4444]/30 p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-error">Zona de risco</h2>
            <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-ink-secondary">
              Ao desativar a conta, seus widgets e links deixam de funcionar e
              todas as sessões são encerradas. É possível{" "}
              <strong className="font-bold text-error">reativar</strong> fazendo
              login novamente.
            </p>
            <div className="mt-4">
              <Button
                variant="danger"
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

export default function AccountPage() {
  const { settings } = useLoaderData<typeof loader>();
  const { preferences, togglePreference } = useAccountPreferences();
  const actionData = useActionData<typeof action>();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const emailActionError =
    actionData && "error" in actionData && actionData.action === "changeEmail"
      ? actionData.error
      : undefined;
  const deactivateActionError =
    actionData && "error" in actionData && actionData.action === "deactivate"
      ? actionData.error
      : undefined;

  return (
    <div>
      <Account
        settings={settings}
        preferences={preferences}
        onTogglePreference={togglePreference}
        onChangePassword={() => setIsPasswordModalOpen(true)}
        onChangeEmail={() => setIsEmailModalOpen(true)}
        onToggleTwoFactor={() => setIsTwoFactorModalOpen(true)}
        onDeactivate={() => setIsDeactivateModalOpen(true)}
      />
      {isDeactivateModalOpen && (
        <DeactivateAccountModal
          isOpen
          actionError={deactivateActionError}
          onClose={() => setIsDeactivateModalOpen(false)}
        />
      )}
      {isEmailModalOpen && settings && (
        <ChangeEmailModal
          isOpen
          currentEmail={settings.email}
          actionError={emailActionError}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}
      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
      {isTwoFactorModalOpen && settings && (
        <TwoFactorModal
          isOpen
          enabled={settings.has2fa}
          onClose={() => setIsTwoFactorModalOpen(false)}
        />
      )}
    </div>
  );
}
