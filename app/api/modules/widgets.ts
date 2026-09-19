import { createApiClient, fetchApi } from "../http/client";

export interface OverlaySettings {
  volume: number; // 0-100
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

export interface Widget<T = OverlaySettings> {
  token: string;
  type: "overlay" | "qrcode";
  active: boolean;
  settings: T;
  updatedAt: string;
}

export const widgetsApi = {
  getSettings: <T extends WidgetType>(
    token: string | null | undefined,
    type: T,
  ) => fetchApi<Widget<WidgetSettingsMap[T]>>(createApiClient(token).get(`/widgets/${type}`)),

  getPublicSettings: <T extends WidgetType = "overlay">(
    widgetToken: string,
  ) => fetchApi<Widget<WidgetSettingsMap[T]>>(createApiClient().get(`/widgets/public/${widgetToken}`)),

  /**
   * Cria ou atualiza (upsert). O PUT substitui o objeto `settings` inteiro,
   * então updates devem enviar o objeto completo. Sem body, o backend
   * aplica os defaults do tipo.
   */
  upsertSettings: <T extends WidgetType>(
    token: string | null | undefined,
    type: T,
    body?: Partial<WidgetSettingsMap[T]>,
  ) =>
    fetchApi<Widget<WidgetSettingsMap[T]>>(
      createApiClient(token).put(`/widgets/${type}`, body),
    ),

  /**
   * Garante que o widget existe: lê e, se ainda não foi criado (404),
   * cria com os defaults do backend via PUT sem body. A criação é
   * implícita — o usuário nunca percebe o estado "não configurado".
   */
  ensureSettings: async <T extends WidgetType>(
    token: string | null | undefined,
    type: T,
  ) => {
    const res = await widgetsApi.getSettings(token, type);
    if (res.success) return res;
    if (res.error.code !== 404) return res;
    return widgetsApi.upsertSettings(token, type);
  },
  testAlert: (token: string | null | undefined) =>
    fetchApi<void>(createApiClient(token).post("/overlay/test")),

  resetToken: (token: string | null | undefined, type: string) =>
    fetchApi<Widget>(createApiClient(token).post(`/widgets/${type}/reset-token`)),
};
