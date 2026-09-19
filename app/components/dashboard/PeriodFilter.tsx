import type { DashboardRange } from "~/api/modules/dashboard";

interface PeriodFilterProps {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
}

const OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
];

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div
      role="group"
      aria-label="Período do resumo"
      className="inline-flex items-center gap-1 rounded-full bg-wash p-1"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`rounded-full px-3.5 h-9 text-xs font-bold outline-none transition-all duration-150 cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 ${
              active
                ? "bg-inverse text-white shadow-xs"
                : "text-ink-secondary hover:text-ink-heading"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
