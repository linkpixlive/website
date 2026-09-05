export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatCentsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** Keeps only digits and inserts thousand/decimal separators as the user types. */
export function maskCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (!digits) return "";
  const cents = Number(digits);
  const reais = Math.floor(cents / 100).toString();
  const decimalPart = (cents % 100).toString().padStart(2, "0");
  return `${reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
}

export function parseCurrencyToCents(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}
