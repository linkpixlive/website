import type { components } from "../generated/api-schema";
import { createApiClient, fetchApi } from "../http/client";

// `userId` existe no payload do banco, mas não pertence ao modelo de UI.
export type DonationSettings = Omit<
  components["schemas"]["DonationSettingsEntity"],
  "userId"
>;

export type UpdateDonationSettingsPayload =
  components["schemas"]["UpdateDonationSettingsDto"];

export const donationSettingsApi = {
  getSettings: (token?: string | null) =>
    fetchApi<DonationSettings>(
      createApiClient(token).get("/donation-settings"),
    ),
  updateSettings: (
    token: string | null | undefined,
    body: UpdateDonationSettingsPayload,
  ) =>
    fetchApi<DonationSettings>(
      createApiClient(token).patch("/donation-settings", body),
    ),
};
