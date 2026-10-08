import type { DashboardRange } from "~/api/modules/dashboard";
import { SegmentedControl } from "~/components/ui/SegmentedControl";

interface PeriodFilterProps {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
  size?: "sm" | "md";
}

const OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
];

export function PeriodFilter({ value, onChange, size = "md" }: PeriodFilterProps) {
  return (
    <SegmentedControl
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label="Período do resumo"
      size={size}
    />
  );
}
