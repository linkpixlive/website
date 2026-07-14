import { Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

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
      <Label className="text-text-secondary text-sm font-medium">{label}</Label>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton
            className={`
              w-full bg-secondary rounded-lg py-2.5 px-3 text-left text-sm text-text-heading
              border transition-colors duration-150 outline-none cursor-pointer flex items-center justify-between
              ${
                error
                  ? "border-error focus:ring-1 focus:ring-error/30"
                  : "border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus/30"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span className={!selectedOption ? "text-text-muted" : "block truncate"}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 text-text-muted pointer-events-none" aria-hidden="true" />
          </ListboxButton>

          <ListboxOptions
            transition
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-surface border border-border py-1 text-base shadow-lg focus:outline-none sm:text-sm transition ease-in duration-100 data-[leave]:data-[closed]:opacity-0"
          >
            {options.length === 0 ? (
              <div className="py-2 px-3 text-sm text-text-muted">Nenhuma opção disponível</div>
            ) : (
              options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  className={({ focus, selected }) => `
                    relative cursor-default select-none py-2.5 pl-3 pr-9 text-sm outline-none
                    ${focus ? "bg-surface-hover text-text-heading" : "text-text-primary"}
                    ${selected ? "font-semibold text-primary" : ""}
                  `}
                >
                  {({ selected, focus }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
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
        <span className="text-error text-xs animate-[shake_0.4s_ease-in-out]">
          {error}
        </span>
      )}
    </Field>
  );
}
