import { useState } from "react";
import {
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/conta";
import { AccountPanel } from "~/components/account/AccountPanel";
import { ChangePasswordModal } from "~/components/account/ChangePasswordModal";
import { ChangeEmailModal } from "~/components/account/ChangeEmailModal";
import { DeactivateAccountModal } from "~/components/account/DeactivateAccountModal";
import { TwoFactorModal } from "~/components/account/TwoFactorModal";
import {
  accountSettingsApi,
  type AccountSettings,
} from "~/api/modules/account-settings";
import { getAuthToken, clearAuthCookie } from "~/util/session.server";
import { z } from "zod";
import {
  changeEmailSchema,
  confirmEmailChangeSchema,
  deactivateAccountSchema,
  setup2faSchema,
  totpField,
} from "~/validators/account-validator";
import { strongPassword } from "~/validators/password";

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

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent"));

  if (intent === "changePassword") {
    // Mesma regra do cliente (sem confirmPassword, que é só client-side).
    const parsed = z
      .object({
        currentPassword: z.string().min(1, "Informe a senha atual"),
        newPassword: strongPassword,
        totp: totpField,
      })
      .safeParse({
        currentPassword: String(formData.get("currentPassword")),
        newPassword: String(formData.get("newPassword")),
        totp: formData.get("totp") ? String(formData.get("totp")) : undefined,
      });
    if (!parsed.success) {
      return {
        success: false,
        action: intent,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const res = await accountSettingsApi.changePassword(token, parsed.data);

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    return { success: true, action: intent, message: res.data.message };
  }

  if (intent === "changeEmail") {
    const parsed = changeEmailSchema.safeParse({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      totp: formData.get("totp") ? String(formData.get("totp")) : undefined,
    });
    if (!parsed.success) {
      return {
        success: false,
        action: intent,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }
    const res = await accountSettingsApi.changeEmail(token, parsed.data);

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    // O backend mantém a sessão atual e guarda o OTP em `email:change:<userId>`;
    // o modal avança para a etapa de confirmação (`confirmEmailChange`).
    return {
      success: true,
      action: intent,
      message: "Código enviado para o novo e-mail.",
    };
  }

  if (intent === "confirmEmailChange") {
    const parsed = confirmEmailChangeSchema.safeParse({
      otp: String(formData.get("otp")),
    });
    if (!parsed.success) {
      return {
        success: false,
        action: intent,
        error: parsed.error.issues[0]?.message ?? "Código inválido",
      };
    }
    const res = await accountSettingsApi.confirmEmailChange(token, parsed.data);

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    return { success: true, action: intent, message: res.data.message };
  }

  if (intent === "2faSetup") {
    const parsed = setup2faSchema.safeParse({
      password: String(formData.get("password") ?? ""),
    });
    if (!parsed.success) {
      return {
        success: false,
        action: intent,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const res = await accountSettingsApi.setup2fa(token, parsed.data);

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
    const parsed = deactivateAccountSchema.safeParse({
      password: String(formData.get("password")),
    });
    if (!parsed.success) {
      return {
        success: false,
        action: intent,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }
    const res = await accountSettingsApi.deactivateAccount(token, parsed.data);

    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }

    throw redirect("/auth/login", {
      headers: { "Set-Cookie": clearAuthCookie() },
    });
  }

  return null;
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
