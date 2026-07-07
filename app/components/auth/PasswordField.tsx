import { Field, Input, Label } from "@headlessui/react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { forwardRef, useState } from "react";

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label: string;
  error?: string | null;
  icon?: LucideIcon;
  showStrength?: boolean;
  strengthScore?: number;
}

const STRENGTH_LABELS = ["", "Fraca", "Razoável", "Bom", "Forte"];

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, icon: Icon, showStrength, strengthScore = 0, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Field className="flex flex-col gap-1.5 w-full">
        <Label className="text-text-secondary text-sm font-medium">{label}</Label>
        <div className="relative flex items-center">
          {Icon && (
            <Icon className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
          )}
          <Input
            ref={ref}
            type={showPassword ? "text" : "password"}
            {...props}
            className={`
              w-full bg-secondary rounded-lg py-2.5 text-sm text-text-heading placeholder:text-text-muted
              border transition-colors duration-150 outline-none pr-10
              ${Icon ? "pl-9" : "pl-3"}
              ${
                error
                  ? "border-error focus:ring-1 focus:ring-error/30"
                  : "border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus/30"
              }
              ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className || ""}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={props.disabled}
            className="absolute right-3 text-text-muted hover:text-text-secondary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {showStrength && props.value && (props.value as string).length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((level) => {
                let bgColor = "bg-border";
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
            <span className="text-xs text-text-muted w-10 text-right">
              {STRENGTH_LABELS[strengthScore]}
            </span>
          </div>
        )}

        {error && (
          <span className="text-error text-xs animate-[shake_0.4s_ease-in-out]">
            {error}
          </span>
        )}
      </Field>
    );
  }
);
PasswordField.displayName = "PasswordField";
