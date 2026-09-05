import { Select } from "@base-ui/react/select";
import { Icon } from "./Icon";
import { FieldError } from "./FieldError";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 12.5L9.5 17.5L19.5 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Selecione uma opção",
  disabled = false,
  className = "",
}: SelectFieldProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <Select.Root
        items={options}
        value={selectedOption ? value : null}
        onValueChange={(newValue) => onChange(newValue as string)}
        disabled={disabled}
      >
        <Select.Label className="text-[13px] font-medium text-ink-secondary">
          {label}
        </Select.Label>
        <Select.Trigger
          className={`
              w-full bg-wash rounded-full py-2.5 px-4 text-left text-sm font-medium text-ink-heading
              border transition-colors duration-150 outline-none cursor-pointer flex items-center justify-between
              ${
                error
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-line focus:border-border-focus focus:ring-2 focus:ring-brand/30"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
        >
          <Select.Value
            placeholder={placeholder}
            className={!selectedOption ? "text-ink-placeholder" : "block truncate"}
          />
          <Select.Icon className="text-ink-secondary pointer-events-none shrink-0 ml-2">
            <Icon name="alt-arrow-down" size={16} strokeWidth={1.9} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Positioner
            alignItemWithTrigger={false}
            sideOffset={8}
            align="start"
            className="z-50 outline-hidden select-none"
          >
            <Select.Popup
              className="max-h-60 min-w-[var(--anchor-width)] overflow-y-auto rounded-[20px] bg-card border border-line p-2 shadow-lg outline-none origin-[var(--transform-origin)] transition-[opacity,scale] duration-150 ease-out data-starting-style:opacity-0 data-starting-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:scale-[0.96]"
            >
              {options.length === 0 ? (
                <div className="py-2 px-3.5 text-[13px] font-medium text-ink-muted">
                  Nenhuma opção disponível
                </div>
              ) : (
                options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="
                      relative cursor-default select-none rounded-xl py-2.5 px-3.5 text-[13px] outline-none
                      text-ink-body font-semibold data-highlighted:bg-wash
                      data-selected:font-bold data-selected:text-ink-heading
                    "
                  >
                    <Select.ItemText className="block truncate">{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="absolute inset-y-0 right-3 h-4 w-4 my-auto text-yellow-ink">
                      <CheckMark />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))
              )}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <FieldError message={error} />
    </div>
  );
}
