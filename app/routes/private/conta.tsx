import { useState } from "react";
import { redirect, useActionData, useLoaderData } from "react-router";
import {
  accountSettingsApi,
  type AccountSettings,
} from "~/api/modules/account-settings";
import { AccountPanel } from "~/components/account/AccountPanel";
import { PageHeader } from "~/components/dashboard/PageHeader";import { ChangeEmailModal } from "~/components/account/ChangeEmailModal";
import { ChangePasswordModal } from "~/components/account/ChangePasswordModal";
import { DeactivateAccountModal } from "~/components/account/DeactivateAccountModal";
import { TwoFactorModal } from "~/components/account/TwoFactorModal";
import { clearAuthCookie, getAuthToken } from "~/util/session.server";
import {
  changeEmailSchema,
  changePasswordActionSchema,
  confirmEmailChangeSchema,
  deactivateAccountSchema,
  setup2faSchema,
} from "~/validators/account-validator";
import type { Route } from "./+types/conta";

const FALLBACK_SETTINGS: AccountSettings = {
  id: "",
  email: "",
  has2fa: false,
  active: true,
  usernameChangedAt: null,
  verifiedEmail: false,
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

type AccountActionResult =
  | { success: false; action: string; error: string }
  | { success: true; action: string; message: string }
  | {
      success: true;
      action: string;
      data: { otpauthUrl: string; secret: string };
    };

const fail = (action: string, error: string) => ({
  success: false as const,
  action,
  error,
});
const okMessage = (action: string, message: string) => ({
  success: true as const,
  action,
  message,
});
const okData = (
  action: string,
  data: { otpauthUrl: string; secret: string },
) => ({ success: true as const, action, data });

const str = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "");

const optStr = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return value ? String(value) : undefined;
};

type IntentHandler = (
  token: string | null,
  formData: FormData,
  intent: string,
) => Promise<AccountActionResult>;

const intentHandlers: Record<string, IntentHandler> = {
  changePassword: async (token, formData, intent) => {
    const parsed = changePasswordActionSchema.safeParse({
      currentPassword: str(formData, "currentPassword"),
      newPassword: str(formData, "newPassword"),
      totp: optStr(formData, "totp"),
    });

    if (!parsed.success) {
      return fail(intent, parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const res = await accountSettingsApi.changePassword(token, parsed.data);
    if (!res.success) return fail(intent, res.error.message);
    return okMessage(intent, res.data.message);
  },
  changeEmail: async (token, formData, intent) => {
    const parsed = changeEmailSchema.safeParse({
      email: str(formData, "email"),
      password: str(formData, "password"),
      totp: optStr(formData, "totp"),
    });
    if (!parsed.success) {
      return fail(intent, parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const res = await accountSettingsApi.changeEmail(token, parsed.data);
    if (!res.success) return fail(intent, res.error.message);
    return okMessage(intent, "Código enviado para o novo e-mail.");
  },
  confirmEmailChange: async (token, formData, intent) => {
    const parsed = confirmEmailChangeSchema.safeParse({
      otp: str(formData, "otp"),
    });
    if (!parsed.success) {
      return fail(intent, parsed.error.issues[0]?.message ?? "Código inválido");
    }
    const res = await accountSettingsApi.confirmEmailChange(token, parsed.data);
    if (!res.success) return fail(intent, res.error.message);
    return okMessage(intent, res.data.message);
  },
  "2faSetup": async (token, formData, intent) => {
    const parsed = setup2faSchema.safeParse({
      password: str(formData, "password"),
    });
    if (!parsed.success) {
      return fail(intent, parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const res = await accountSettingsApi.setup2fa(token, parsed.data);
    if (!res.success) return fail(intent, res.error.message);
    return okData(intent, {
      otpauthUrl: res.data.otpauthUrl,
      secret: res.data.secret,
    });
  },
  "2faEnable": async (token, formData, intent) => {
    const res = await accountSettingsApi.enable2fa(token, {
      token: str(formData, "token"),
    });
    if (!res.success) return fail(intent, res.error.message);
    return okMessage(intent, res.data.message);
  },
  "2faDisable": async (token, formData, intent) => {
    const res = await accountSettingsApi.disable2fa(token, {
      password: str(formData, "password"),
      token: str(formData, "token"),
    });
    if (!res.success) return fail(intent, res.error.message);
    return okMessage(intent, res.data.message);
  },
  deactivate: async (token, formData, intent) => {
    const parsed = deactivateAccountSchema.safeParse({
      password: str(formData, "password"),
    });
    if (!parsed.success) {
      return fail(intent, parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const res = await accountSettingsApi.deactivateAccount(token, parsed.data);
    if (!res.success) return fail(intent, res.error.message);
    throw redirect("/auth/login", {
      headers: { "Set-Cookie": clearAuthCookie() },
    });
  },
};

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent"));
  const handler = intentHandlers[intent];
  if (!handler) return null;
  return handler(token, formData, intent);
}

export default function AccountPage() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [modal, setModal] = useState<
    "password" | "email" | "2fa" | "deactivate" | null
  >(null);

  const deactivateActionError =
    actionData && "error" in actionData && actionData.action === "deactivate"
      ? actionData.error
      : undefined;

  return (
    <div>
      {/* Title block */}
      <PageHeader
        title="Conta"
        subtitle="Gerencie seu e-mail, senha e segurança da conta."
      />

      <AccountPanel
        settings={settings}
        onChangePassword={() => setModal("password")}
        onChangeEmail={() => setModal("email")}
        onToggleTwoFactor={() => setModal("2fa")}
        onDeactivate={() => setModal("deactivate")}
      />
      {modal === "deactivate" && (
        <DeactivateAccountModal
          isOpen
          actionError={deactivateActionError}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "email" && settings && (
        <ChangeEmailModal
          isOpen
          currentEmail={settings.email}
          has2fa={settings.has2fa}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "password" && settings && (
        <ChangePasswordModal
          isOpen
          has2fa={settings.has2fa}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "2fa" && settings && (
        <TwoFactorModal
          isOpen
          enabled={settings.has2fa}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
