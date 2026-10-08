import { Tabs } from "@base-ui/react/tabs";
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
    <Tabs.Root value={value} onValueChange={(next) => onChange(next as T)}>
      <Tabs.List
        aria-label={label}
        className="inline-flex items-center gap-1 rounded-full border border-line bg-card p-1"
      >
        {options.map((opt) => (
          <Tabs.Tab
            key={opt.value}
            value={opt.value}
            className={cn(
              "rounded-full outline-none transition-all duration-150 cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40",
              SIZES[size].button,
              "text-ink-secondary hover:text-ink-heading",
              "data-active:bg-inverse data-active:text-on-inverse data-active:shadow-xs data-active:hover:text-on-inverse",
            )}
          >
            {opt.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
