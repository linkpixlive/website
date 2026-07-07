import { Field, Input, Label } from "@headlessui/react";
import type { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string; // Ensure name is required for RHF
  label: string;
  error?: string | null;
  icon?: LucideIcon;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon: Icon, className, ...props }, ref) => {
    return (
      <Field className="flex flex-col gap-1.5 w-full">
        <Label className="text-text-secondary text-sm font-medium">{label}</Label>
        <div className="relative flex items-center">
          {Icon && (
            <Icon className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
          )}
          <Input
            ref={ref}
            {...props}
            className={`
              w-full bg-secondary rounded-lg py-2.5 text-sm text-text-heading placeholder:text-text-muted
              border transition-colors duration-150 outline-none
              ${Icon ? "pl-9 pr-3" : "px-3"}
              ${
                error
                  ? "border-error focus:ring-1 focus:ring-error/30"
                  : "border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus/30"
              }
              ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className || ""}
            `}
          />
        </div>
        {error && (
          <span className="text-error text-xs animate-[shake_0.4s_ease-in-out]">
            {error}
          </span>
        )}
      </Field>
    );
  }
);
FormField.displayName = "FormField";
