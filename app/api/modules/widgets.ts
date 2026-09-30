import type { components } from "../generated/api-schema";
import { api, authHeaders, fetchApi } from "../http/client";

export interface OverlaySettings {
  volume: number;
  speakNameAmount: boolean;
  defaultNarrator: string;
  audioOnly: boolean;
  isPaused: boolean;
}

export interface QrCodeSettings {
  color: string;
  size: number;
}

export type WidgetType = "overlay" | "qrcode";

export type WidgetSettingsMap = {
  overlay: OverlaySettings;
  qrcode: QrCodeSettings;
};

export interface Widget<T = OverlaySettings> extends Omit<
  components["schemas"]["WidgetEntity"],
  "settings"
> {
  settings: T;
}

export const widgetsApi = {
  getSettings: <T extends WidgetType>(
    token: string | null | undefined,
    type: T,
  ) =>
    fetchApi<Widget<WidgetSettingsMap[T]>>(
      api.get(`/widgets/${type}`, { headers: authHeaders(token) }),
    ),

  getPublicSettings: <T extends WidgetType = "overlay">(widgetToken: string) =>
    fetchApi<Widget<WidgetSettingsMap[T]>>(
      api.get(`/widgets/public/${widgetToken}`),
    ),

  upsertSettings: <T extends WidgetType>(
    token: string | null | undefined,
    type: T,
    body?: Partial<WidgetSettingsMap[T]>,
  ) =>
    fetchApi<Widget<WidgetSettingsMap[T]>>(
      api.put(`/widgets/${type}`, body, { headers: authHeaders(token) }),
    ),

  resetToken: (token: string | null | undefined, type: string) =>
    fetchApi<Widget>(
      api.post(`/widgets/${type}/reset-token`, undefined, {
        headers: authHeaders(token),
      }),
    ),
};
