/** +13,7% / −20% em pt-BR, com sinal. Null quando não há base de comparação. */
export function formatDeltaPct(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  return `${sign}${abs}%`;
}

/** "YYYY-MM-DD" como data local (evita o shift de fuso do `new Date(iso)`). */
function parseLocalDate(isoDate: string): Date | null {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatShortDate(isoDate: string) {
  const date = parseLocalDate(isoDate);
  if (!date) return isoDate;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatLongDate(isoDate: string) {
  const date = parseLocalDate(isoDate);
  if (!date) return isoDate;
  return date.toLocaleDateString("pt-BR", {
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

function formatPeakDay(day: number | null) {
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
