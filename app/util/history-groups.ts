import type { DonationHistory } from "~/api/modules/dashboard";

const MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Rótulo editorial do grupo: "Hoje", "Ontem" ou "12 de set". */
export function formatGroupLabel(
  iso: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!iso) return "Sem data";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sem data";
  const days = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000,
  );
  if (days <= 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

export interface HistoryGroup {
  key: string;
  label: string;
  items: DonationHistory[];
}

function groupKey(iso: string | null | undefined): string {
  if (!iso) return "sem-data";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "sem-data";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Agrupa preservando a ordem de chegada (itens já vêm ordenados). */
export function groupHistoryByDate(
  items: DonationHistory[],
  now: Date = new Date(),
): HistoryGroup[] {
  const groups: HistoryGroup[] = [];
  for (const item of items) {
    const key = groupKey(item.approvedAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, label: formatGroupLabel(item.approvedAt, now), items: [item] });
    }
  }
  return groups;
}
