import type { DonationHistory } from "~/api/modules/dashboard";

export interface DonationDayGroup {
  key: string;
  label: string;
  total: number;
  items: DonationHistory[];
}

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

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dayLabel(date: Date, now: Date): string {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86_400_000);
  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// Agrupa o histórico por dia local (mais recente primeiro) para o ledger.
// Itens sem data válida caem em "Sem data", sempre por último.
export function groupDonationsByDay(
  items: DonationHistory[],
  now: Date = new Date(),
): DonationDayGroup[] {
  const groups = new Map<string, DonationDayGroup>();

  for (const item of items) {
    const date = item.approvedAt ? new Date(item.approvedAt) : null;
    const valid = date !== null && !Number.isNaN(date.getTime());
    const key = valid ? dayKey(date as Date) : "sem-data";
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        label: valid ? dayLabel(date as Date, now) : "Sem data",
        total: 0,
        items: [],
      };
      groups.set(key, group);
    }
    group.items.push(item);
    group.total += item.amount;
  }

  return [...groups.values()].sort((a, b) => {
    if (a.key === "sem-data") return 1;
    if (b.key === "sem-data") return -1;
    return b.key < a.key ? -1 : b.key > a.key ? 1 : 0;
  });
}
