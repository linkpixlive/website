export interface StreamerProfile {
  name: string;
  username: string;
  profileImageUrl: string | null;
  overlayActive: boolean;
  minAudioAmount: number;
  minTextAmount: number;
  maxLength: number;
}

export interface TtsVoice {
  id: string;
  name: string;
  tag: string;
  sampleUrl: string;
}

export type DonationStatus = "pending" | "paid" | "displayed" | "failed" | "expired";

export interface DonationPayment {
  id: string;
  amount: number;
  pix: string;
  createdAt: number;
  expiredAt: number;
}
