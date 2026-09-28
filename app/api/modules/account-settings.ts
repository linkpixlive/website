import type { components } from "../generated/api-schema";
import { createApiClient, fetchApi } from "../http/client";

export type AccountSettings = components["schemas"]["AccountEntity"] & {
  // `id` existe no runtime (@Expose), mas fica fora do Swagger (@ApiHideProperty).
  id: string;
};

export type ChangePasswordPayload =
  components["schemas"]["ChangePasswordDto"];

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

export const accountSettingsApi = {
  getSettings: (token?: string | null) =>
    fetchApi<AccountSettings>(createApiClient(token).get("/account")),
  updateProfile: (token: string | null, body: UpdateProfilePayload) =>
    fetchApi<components["schemas"]["UpdateProfileResponseDto"]>(
      createApiClient(token).patch("/account/profile", body),
    ),
  changePassword: (token: string | null, body: ChangePasswordPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).patch("/account/password", body),
    ),
  changeEmail: (token: string | null, body: ChangeEmailPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).patch("/account/email", body),
    ),
  deactivateAccount: (token: string | null, body: DeactivateAccountPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).patch("/account/deactivate", body),
    ),
  setup2fa: (token: string | null, body: Setup2faPayload) =>
    fetchApi<Setup2faResponse>(
      createApiClient(token).post("/account/2fa/setup", body),
    ),
  enable2fa: (token: string | null, body: Enable2faPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).post("/account/2fa/enable", body),
    ),
  disable2fa: (token: string | null, body: Disable2faPayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).post("/account/2fa/disable", body),
    ),
  confirmEmailChange: (token: string | null, body: ConfirmEmailChangePayload) =>
    fetchApi<MessageResponse>(
      createApiClient(token).post("/account/email/verify", body),
    ),
};
