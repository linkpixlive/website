import { Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Icon } from "./Icon";

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
    <Field className={`flex flex-col gap-1.5 w-full ${className}`}>
      <Label className="text-[13px] font-medium text-ink-secondary">{label}</Label>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton
            className={`
              w-full bg-wash rounded-full py-2.5 px-4 text-left text-sm font-medium text-ink-heading
              border transition-colors duration-150 outline-none cursor-pointer flex items-center justify-between
              ${
                error
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-gray-100/80 focus:border-[#fcc717] focus:ring-2 focus:ring-brand/30"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span className={!selectedOption ? "text-ink-placeholder" : "block truncate"}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <Icon
              name="alt-arrow-down"
              size={16}
              strokeWidth={1.9}
              className="text-ink-secondary pointer-events-none shrink-0 ml-2"
            />
          </ListboxButton>

          <ListboxOptions
            transition
            className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-[20px] bg-card border border-gray-100/70 p-2 text-base shadow-lg focus:outline-none sm:text-sm animate-pop-in data-[leave]:data-[closed]:opacity-0"
          >
            {options.length === 0 ? (
              <div className="py-2 px-3.5 text-[13px] font-medium text-ink-muted">
                Nenhuma opção disponível
              </div>
            ) : (
              options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  className={({ focus }) => `
                    relative cursor-default select-none rounded-xl py-2.5 px-3.5 text-[13px] outline-none
                    ${focus ? "bg-wash text-ink-body" : "text-ink-body"}
                    ${option.value === value ? "font-bold text-ink-heading" : "font-semibold"}
                  `}
                >
                  {({ selected }) => (
                    <>
                      <span className="block truncate">{option.label}</span>
                      {selected && (
                        <CheckMark className="absolute inset-y-0 right-3 h-4 w-4 my-auto top-1/2 -translate-y-1/2 text-yellow-ink" />
                      )}
                    </>
                  )}
                </ListboxOption>
              ))
            )}
          </ListboxOptions>
        </div>
      </Listbox>
      {error && (
        <span className="text-error text-xs font-medium animate-[shake_0.4s_ease-in-out]">
          {error}
        </span>
      )}
    </Field>
  );
}
