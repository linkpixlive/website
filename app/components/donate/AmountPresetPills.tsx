import { formatCentsBRL, formatCentsToInput } from "~/util/currency";
import { cn } from "~/util/cn";

export interface AmountPresetPillsProps {
  presets: number[];
  selectedValue: string;
  onSelect: (cents: number) => void;
  disabled?: boolean;
  className?: string;
}

export function AmountPresetPills({
  presets,
  selectedValue,
  onSelect,
  disabled,
  className,
}: AmountPresetPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label="Valores sugeridos">
      {presets.map((cents) => {
        const formatted = formatCentsBRL(cents);
        const inputValue = formatCentsToInput(cents);
        const isSelected = selectedValue === inputValue;

        return (
          <button
            key={cents}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onSelect(cents)}
            className={cn(
              "h-8 px-3 inline-flex items-center rounded-full text-xs font-bold border transition-all duration-150 cursor-pointer outline-none active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-brand/40",
              isSelected
                ? "bg-brand-button text-on-brand border-transparent shadow-sm"
                : "bg-wash text-ink-body border-line hover:bg-wash-hover",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            aria-pressed={isSelected}
            aria-label={`Doar ${formatted}`}
          >
            {formatted}
          </button>
        );
      })}
    </div>
  );
}