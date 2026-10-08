/** Centavos (int) → "R$ 10,00". Nome explícito: não confundir com
 *  formatBRLReais (reais float do backend) — trocar um pelo outro é bug 100×. */
export function formatCentsBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Backend retorna reais como float (ex. 16.50): formata direto, sem /100. */
export function formatBRLReais(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Limiar do "Agora" nas linhas de fila/histórico (90s). */
export const JUST_NOW_THRESHOLD_MS = 90_000;

/** ISO aconteceu há menos que o limiar em relação a `now`? */
export function isJustNow(
  dateString: string | null | undefined,
  now: number,
  thresholdMs: number = JUST_NOW_THRESHOLD_MS,
): boolean {
  if (!dateString) return false;
  const time = new Date(dateString).getTime();
  if (Number.isNaN(time)) return false;
  const age = now - time;
  return age >= 0 && age < thresholdMs;
}

/** "14:32" a partir de ISO ("Agora" se fresco e `now` informado).
 *  Usado nas linhas de fila. */
export function formatTimestamp(
  dateString: string,
  now?: number | null,
): string {
  if (now != null && isJustNow(dateString, now)) return "Agora";
  return new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "20/09/2026, 14:32" a partir de ISO; "—" quando inválido. */
export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DownloadableDonation {
  name: string;
  id: string;
  approvedAt: string | null;
  voiceUrl: string | null;
}

export function buildDownloadName(item: DownloadableDonation): string {
  const slug =
    item.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "doacao";
  const stamp = item.approvedAt ? new Date(item.approvedAt).getTime() : item.id;
  const ext = item.voiceUrl?.toLowerCase().endsWith(".mp3") ? "mp3" : "wav";
  return `doacao-${slug}-${stamp}.${ext}`;
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

/** Limita centavos ao teto (ex.: valor máximo de saque). */
export function clampCents(cents: number, maxCents: number): number | null {
  if (!cents) return null;
  return Math.min(cents, maxCents);
}
