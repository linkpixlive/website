const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export function normalizeUsername(
  value: string | null | undefined,
): string | null {
  if (!value || !USERNAME_RE.test(value)) return null;
  return value;
}
