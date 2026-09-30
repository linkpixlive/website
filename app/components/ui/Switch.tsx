import { Switch as BaseSwitch } from "@base-ui/react/switch";

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Switch({ checked, onChange, disabled, label }: SwitchProps) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={label}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95
        focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-brand-button" : "bg-wash border border-line-input"}
      `}
    >
      <BaseSwitch.Thumb
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-2xs transition-transform duration-150 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </BaseSwitch.Root>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  name?: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ToggleRow({
  label,
  description,
  name,
  checked,
  onToggle,
  disabled,
}: ToggleRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5">
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-ink-body leading-tight">
          {label}
        </span>
        <span className="block text-xs font-medium text-ink-muted mt-0.5">
          {description}
        </span>
      </span>
      {name && <input type="hidden" name={name} value={String(checked)} />}
      <Switch
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        label={label}
      />
    </div>
  );
}
