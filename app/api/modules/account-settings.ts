import type { components } from "../generated/api-schema";
import { api, authHeaders, fetchApi } from "../http/client";

export type AccountSettings = components["schemas"]["AccountEntity"] & {
  id: string;
};

export type ChangePasswordPayload = components["schemas"]["ChangePasswordDto"];

export type ChangeEmailPayload = components["schemas"]["ChangeEmailDto"];

export type DeactivateAccountPayload =
  components["schemas"]["DeactivateAccountDto"];

export type Enable2faPayload = components["schemas"]["Enable2faDto"];

export type Disable2faPayload = components["schemas"]["Disable2faDto"];

export type Setup2faPayload = components["schemas"]["Setup2faDto"];

export type Setup2faResponse = components["schemas"]["Setup2faEntity"];

export type ConfirmEmailChangePayload =
  components["schemas"]["ConfirmEmailChangeDto"];

export type UpdateProfilePayload = components["schemas"]["UpdateProfileDto"];

export type MessageResponse = components["schemas"]["MessageDto"];

export type UpdateProfileResponse =
  components["schemas"]["UpdateProfileResponseDto"];

export const accountSettingsApi = {
  getSettings: (token?: string | null) =>
    fetchApi<AccountSettings>(
      api.get("/account", { headers: authHeaders(token) }),
    ),
  updateProfile: (token: string | null, body: UpdateProfilePayload) =>
    fetchApi<UpdateProfileResponse>(
      api.patch("/account/profile", body, { headers: authHeaders(token) }),
    ),
  changePassword: (token: string | null, body: ChangePasswordPayload) =>
    fetchApi<MessageResponse>(
      api.patch("/account/password", body, { headers: authHeaders(token) }),
    ),
  changeEmail: (token: string | null, body: ChangeEmailPayload) =>
    fetchApi<MessageResponse>(
      api.patch("/account/email", body, { headers: authHeaders(token) }),
    ),
  deactivateAccount: (token: string | null, body: DeactivateAccountPayload) =>
    fetchApi<MessageResponse>(
      api.patch("/account/deactivate", body, { headers: authHeaders(token) }),
    ),
  setup2fa: (token: string | null, body: Setup2faPayload) =>
    fetchApi<Setup2faResponse>(
      api.post("/account/2fa/setup", body, { headers: authHeaders(token) }),
    ),
  enable2fa: (token: string | null, body: Enable2faPayload) =>
    fetchApi<MessageResponse>(
      api.post("/account/2fa/enable", body, { headers: authHeaders(token) }),
    ),
  disable2fa: (token: string | null, body: Disable2faPayload) =>
    fetchApi<MessageResponse>(
      api.post("/account/2fa/disable", body, { headers: authHeaders(token) }),
    ),
  confirmEmailChange: (token: string | null, body: ConfirmEmailChangePayload) =>
    fetchApi<MessageResponse>(
      api.post("/account/email/verify", body, { headers: authHeaders(token) }),
    ),
};
