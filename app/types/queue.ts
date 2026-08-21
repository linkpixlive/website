export interface OverlayDonationEntity {
  id: string;
  donorName: string;
  amountFormatted: string;
  message: string;
  donorAvatarUrl: string;
  createdAt: string;
  voiceUrl?: string;
  audioUrl?: string;
}

export interface OverlayStatus {
  online: boolean;
}
