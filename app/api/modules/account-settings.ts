import { createApiClient, fetchApi } from "../http/client";

export interface AccountSettings {
  id: string;
  email: string;
  has2fa: boolean;
  active: boolean;
  usernameChangedAt: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailPayload {
  email: string;
  password: string;
}

export interface DeactivateAccountPayload {
  password: string;
}

export interface Enable2faPayload {
  token: string;
}

export interface Setup2faResponse {
  otpauthUrl: string;
  secret: string;
}

export interface MessageResponse {
  message: string;
}

export const accountSettingsApi = {
  getSettings: (token?: string | null) =>
    fetchApi<AccountSettings>(createApiClient(token).get("/account-settings")),
  changePassword: (token: string | null, body: ChangePasswordPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).patch("/account-settings/password", body),
    ),
  changeEmail: (token: string | null, body: ChangeEmailPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).patch("/account-settings/email", body),
    ),
  deactivateAccount: (token: string | null, body: DeactivateAccountPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).patch("/account-settings/deactivate", body),
    ),
  setup2fa: (token: string | null) =>
    fetchApi<Setup2faResponse>(
      createApiClient(token).post("/account-settings/2fa/setup"),
    ),
  enable2fa: (token: string | null, body: Enable2faPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).post("/account-settings/2fa/enable", body),
    ),
  disable2fa: (token: string | null, body: DeactivateAccountPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).post("/account-settings/2fa/disable", body),
    ),
};
