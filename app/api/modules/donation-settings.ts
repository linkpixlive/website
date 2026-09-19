import { createApiClient, fetchApi } from "../http/client";

export interface DonationSettings {
  id: string;
  maxLength: number;
  minAudioAmount: number;
  minTextAmount: number;
  aiModeration: boolean;
  filterProfanity: boolean;
  filterSpam: boolean;
  filterHateSpeech: boolean;
  customRules: string;
  defaultVoiceId: string | null;
  updatedAt: string;
}

export interface UpdateDonationSettingsPayload {
  maxLength?: number;
  minAudioAmount?: number;
  minTextAmount?: number;
  aiModeration?: boolean;
  filterProfanity?: boolean;
  filterSpam?: boolean;
  filterHateSpeech?: boolean;
  customRules?: string;
}

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
