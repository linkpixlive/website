import type { ReactNode } from "react";
import { useState } from "react";
import {
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/conta";
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
      token: String(formData.get("token")),
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
        <section
          aria-label="Segurança"
          className="rounded-[26px] bg-card border border-line shadow-xs p-5 lg:col-span-12"
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
          aria-label="Zona de risco"
          className="rounded-[26px] bg-card border border-line shadow-xs p-5 lg:col-span-12"
        >
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

export default function AccountPage() {
  const { settings } = useLoaderData<typeof loader>();
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
