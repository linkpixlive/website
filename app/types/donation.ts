export interface StreamerProfile {
  name: string;
  username: string;
  verified: boolean;
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
  sampleUrl: string | null;
  imageUrl: string | null;
}

// Client-only: "expired" não existe no schema, derivado de expiredAt no frontend.
export type DonationStatus = "pending" | "paid" | "displayed" | "failed" | "expired";

export interface DonationPayment {
  id: string;
  amount: number;
  pix: string;
  createdAt: number;
  expiredAt: number;
}

export interface DonationView {
  id: string;
  status: DonationStatus;
  amount: number;
  donorName: string;
  message: string | null;
  streamerName: string;
  streamerUsername: string;
  voiceName: string | null;
  createdAt: number;
  expiredAt: number;
}
