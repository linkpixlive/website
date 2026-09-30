import type { components } from "../generated/api-schema";
import { api, authHeaders, fetchApi } from "../http/client";

export type DonationSettings = Omit<
  components["schemas"]["DonationSettingsEntity"],
  "userId"
>;

export type UpdateDonationSettingsPayload =
  components["schemas"]["UpdateDonationSettingsDto"];

export const donationSettingsApi = {
  getSettings: (token?: string | null) =>
    fetchApi<DonationSettings>(
      api.get("/donation-settings", { headers: authHeaders(token) }),
    ),
  updateSettings: (
    token: string | null | undefined,
    body: UpdateDonationSettingsPayload,
  ) =>
    fetchApi<DonationSettings>(
      api.patch("/donation-settings", body, { headers: authHeaders(token) }),
    ),
};
