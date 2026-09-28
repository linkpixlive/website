import { cn } from "~/util/cn";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

const SIZES = {
  sm: { container: "", button: "px-3 h-8 text-[11px] font-extrabold" },
  md: { container: "", button: "px-3.5 h-9 text-xs font-bold" },
} as const;

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: keyof typeof SIZES;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full bg-wash p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "rounded-full outline-none transition-all duration-150 cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40",
              SIZES[size].button,
              active
                ? "bg-inverse text-white shadow-xs"
                : "text-ink-secondary hover:text-ink-heading",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
