import type { OverlaySettings } from "~/api/modules/widgets";

/** Formas que o backend pode enviar em `settings_updated`. */
export type SettingsUpdatedPayload =
  | { settings: OverlaySettings }
  | OverlaySettings
  | null
  | undefined;

/** Narrowing mínimo do contrato real (volume é o campo onipresente). */
export function isOverlaySettings(value: unknown): value is OverlaySettings {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { volume?: unknown }).volume === "number"
  );
}

/**
 * Resolve `settings_updated` sem REST quando o payload já traz as
 * settings (W6). Retorna `null` quando é preciso o fallback `GET`.
 */
export function resolveSettingsUpdate(payload: unknown): OverlaySettings | null {
  if (isOverlaySettings(payload)) return payload;
  if (
    typeof payload === "object" &&
    payload !== null &&
    isOverlaySettings((payload as { settings?: unknown }).settings)
  ) {
    return (payload as { settings: OverlaySettings }).settings;
  }
  return null;
}
