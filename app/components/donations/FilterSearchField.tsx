import { useEffect, useId, useState } from "react";
import { Menu } from "@base-ui/react/menu";
import { Icon } from "~/components/ui/Icon";

interface FilterSearchOption {
  value: string;
  label: string;
}

interface FilterSearchFieldProps {
  label: string;
  options: FilterSearchOption[];
  value: string;
  onValueChange: (value: string) => void;
  searchValue: string;
  onSearchCommit: (trimmed: string) => void;
  placeholder?: string;
}

function CheckMark({ className }: { className?: string }) {
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

export function FilterSearchField({
  label,
  options,
  value,
  onValueChange,
  searchValue,
  onSearchCommit,
  placeholder,
}: FilterSearchFieldProps) {
  const inputId = useId();
  const [inputValue, setInputValue] = useState(searchValue);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed === searchValue) return;
    if (trimmed.length === 1 && searchValue === "") return;
    const timer = setTimeout(() => onSearchCommit(trimmed), 350);
    return () => clearTimeout(timer);
  }, [inputValue, searchValue, onSearchCommit]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={inputId}
        className="text-[13px] font-medium text-ink-secondary"
      >
        {label}
      </label>
      <div className="flex items-center w-full bg-wash rounded-full border border-line-input focus-within:border-border-focus focus-within:ring-2 focus-within:ring-brand/30 transition-all overflow-hidden">
        <Menu.Root modal={false}>
          <Menu.Trigger
            aria-label={`Tipo de busca: ${selectedOption?.label ?? ""}`}
            title="Alterar tipo de busca"
            className="shrink-0 w-9 h-9 my-1 ml-1 rounded-full flex items-center justify-center text-chrome-icon hover:text-ink-heading hover:bg-tile transition-colors duration-150 outline-none cursor-pointer"
          >
            <Icon name="filter" size={16} strokeWidth={1.9} />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner
              align="start"
              side="bottom"
              sideOffset={8}
              className="z-50 outline-hidden select-none"
            >
              <Menu.Popup className="min-w-40 rounded-[20px] bg-card border border-line p-2 shadow-lg outline-none origin-[var(--transform-origin)] transition-[opacity,scale] duration-150 ease-out data-starting-style:opacity-0 data-starting-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:scale-[0.96]">
                <p className="px-3.5 pb-1.5 pt-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
                  Buscar por
                </p>
                {options.map((option) => (
                  <Menu.Item
                    key={option.value}
                    onClick={() => onValueChange(option.value)}
                    className="relative cursor-default select-none rounded-xl py-2.5 pl-3.5 pr-9 text-[13px] outline-none text-ink-body font-semibold data-highlighted:bg-wash"
                  >
                    {option.label}
                    {option.value === value && (
                      <span className="absolute inset-y-0 right-3 h-4 w-4 my-auto text-yellow-ink">
                        <CheckMark />
                      </span>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>

        {selectedOption && (
          <span className="shrink-0 pl-2 pr-1 text-[13px] font-bold text-ink-heading">
            {selectedOption.label}:
          </span>
        )}

        <div className="relative flex-1 min-w-0">
          <input
            id={inputId}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="w-full bg-transparent py-2.5 pr-4 pl-2 border-0 outline-none text-[13px] font-medium text-ink-body placeholder:text-ink-placeholder"
          />
        </div>
      </div>
    </div>
  );
}