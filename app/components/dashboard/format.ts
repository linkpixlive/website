export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** +13,7% / −20% em pt-BR, com sinal. Null quando não há base de comparação. */
export function formatDeltaPct(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  return `${sign}${abs}%`;
}

export function formatShortDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

export function formatLongDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatRangeLabel(startIso: string, endIso: string) {
  const start = new Date(startIso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const end = new Date(endIso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return `${start} a ${end}`;
}

const WEEKDAY_FULL = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export function formatPeakDay(day: number | null) {
  if (day === null || day < 0 || day > 6) return null;
  return WEEKDAY_FULL[day];
}

/** "no domingo" / "na terça-feira" — artigo conforme o dia. */
export function formatPeakDayWithArticle(day: number | null) {
  const name = formatPeakDay(day);
  if (name === null) return null;
  const article = day === 0 || day === 6 ? "no" : "na";
  return `${article} ${name}`;
}

/** "meia-noite" / "meio-dia" / "21h" (sem preposição — o chamador compõe). */
export function formatPeakHour(hour: number | null | undefined) {
  if (hour === null || hour === undefined || hour < 0 || hour > 23) return null;
  if (hour === 0) return "meia-noite";
  if (hour === 12) return "meio-dia";
  return `${hour}h`;
}
