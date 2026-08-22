import { Field, Input, Label } from "@headlessui/react";
import { forwardRef, useState } from "react";
import { Icon } from "~/components/ui/Icon";
import type { IconName } from "~/components/ui/Icon";

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label: string;
  error?: string | null;
  icon?: IconName;
  showStrength?: boolean;
  strengthScore?: number;
}

const STRENGTH_LABELS = ["", "Fraca", "Razoável", "Bom", "Forte"];

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, icon, showStrength, strengthScore = 0, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

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
            type={showPassword ? "text" : "password"}
            {...props}
            className={`
              w-full bg-wash rounded-full py-2.5 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder
              border border-gray-100/80 transition-colors duration-150 outline-none
              focus:border-[#fcc717] focus:ring-2 focus:ring-brand/30
              ${icon ? "pl-10" : "pl-4"} pr-11
              ${
                error
                  ? "!border-error focus:!border-error focus:!ring-error/20"
                  : ""
              }
              ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className || ""}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={props.disabled}
            className="absolute right-4 text-chrome-icon hover:text-ink-heading active:scale-95 transition-all duration-150 cursor-pointer outline-none"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            <Icon name={showPassword ? "eye-closed" : "eye"} size={16} strokeWidth={1.9} />
          </button>
        </div>

        {showStrength && props.value && (props.value as string).length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((level) => {
                let bgColor = "bg-gray-100";
                if (strengthScore >= level) {
                  if (strengthScore === 1) bgColor = "bg-error";
                  else if (strengthScore === 2) bgColor = "bg-warning";
                  else if (strengthScore === 3) bgColor = "bg-warning";
                  else bgColor = "bg-success";
                }
                return (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${bgColor}`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-medium text-ink-muted w-10 text-right">
              {STRENGTH_LABELS[strengthScore]}
            </span>
          </div>
        )}

        {error && (
          <span className="text-error text-xs font-medium animate-[shake_0.4s_ease-in-out]">
            {error}
          </span>
        )}
      </Field>
    );
  }
);
PasswordField.displayName = "PasswordField";
