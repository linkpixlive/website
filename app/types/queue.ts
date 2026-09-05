export interface OverlayDonationEntity {
  id: string;
  name: string;
  amount: number;
  message: string | null;
  audioUrl: string | null;
  messageType: string | null;
  createdAt: string;
  isTest?: boolean;
  isCurrent?: boolean;
}

export interface OverlayStatus {
  online: boolean;
  isPaused?: boolean;
}
