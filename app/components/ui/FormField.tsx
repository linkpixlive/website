import { Field, Input, Label } from "@headlessui/react";
import { forwardRef } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string; // Ensure name is required for RHF
  label: string;
  error?: string | null;
  icon?: IconName;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <Field className="flex flex-col gap-1.5 w-full">
        <Label className="text-[13px] font-medium text-ink-secondary">{label}</Label>
        <div className="relative flex items-center">
          {icon && (
            <Icon
              name={icon}
              size={16}
              strokeWidth={1.9}
              className="absolute left-4 text-ink-secondary pointer-events-none"
            />
          )}
          <Input
            ref={ref}
            {...props}
            className={`
              w-full bg-wash rounded-full py-2.5 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder
              border transition-colors duration-150 outline-none
              ${icon ? "pl-10 pr-4" : "px-4"}
              ${
                error
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-gray-100/80 focus:border-[#fcc717] focus:ring-2 focus:ring-brand/30"
              }
              ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className || ""}
            `}
          />
        </div>
        {error && (
          <span className="text-error text-xs font-medium animate-[shake_0.4s_ease-in-out]">
            {error}
          </span>
        )}
      </Field>
    );
  }
);
FormField.displayName = "FormField";
