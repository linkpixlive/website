import type { OverlaySettings } from "~/api/modules/widgets";

export type SettingsUpdatedPayload =
  | { settings: OverlaySettings }
  | OverlaySettings
  | null
  | undefined;

export function isOverlaySettings(value: unknown): value is OverlaySettings {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { volume?: unknown }).volume === "number"
  );
}

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
