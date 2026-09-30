/** Allowlist simples de mídia: relativo/blob/https. Bloqueia javascript:/data:/http:. */
export function isSafeMediaUrl(
  url: string | null | undefined,
): boolean {
  if (!url) return false;
  if (url.startsWith("/") || url.startsWith("blob:")) return true;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
