/** Parsers do `action` de regras de doação (FormData → valores válidos). */
export function parseDonationAmount(
  raw: FormDataEntryValue | null,
): number | undefined {
  if (raw === null) return undefined;
  const value = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(value) || value < 1) return undefined;
  return Math.round(value * 100) / 100;
}

export function parseDonationMaxLength(
  raw: FormDataEntryValue | null,
): number | undefined {
  if (raw === null) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 250) return undefined;
  return value;
}
