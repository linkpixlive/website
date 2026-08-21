import { createApiClient, fetchApi } from "../http/client";

export interface OverlaySettings {
  volume: number; // 0-100
  speakNameAmount: boolean;
  defaultNarrator: string;
  isPaused: boolean;
}

export interface Widget<T = OverlaySettings> {
  token: string;
  type: "overlay" | "qrcode";
  active: boolean;
  settings: T;
  updatedAt: string;
}

export const widgetsApi = {
  getSettings: (token: string | null | undefined, type: string) =>
    fetchApi<Widget>(createApiClient(token).get(`/widgets/${type}`)),

  createSettings: (token: string | null | undefined, type: string, body: Partial<OverlaySettings>) =>
    fetchApi<Widget>(createApiClient(token).post(`/widgets/${type}`, body)),

  updateSettings: (token: string | null | undefined, type: string, body: Partial<OverlaySettings>) =>
    fetchApi<Widget>(createApiClient(token).put(`/widgets/${type}`, body)),

  testAlert: (token: string | null | undefined) =>
    fetchApi<void>(createApiClient(token).post("/overlay/test")),

  resetToken: (token: string | null | undefined, type: string) =>
    fetchApi<Widget>(createApiClient(token).post(`/widgets/${type}/reset-token`)),
};
