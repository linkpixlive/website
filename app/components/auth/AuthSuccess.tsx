import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/Button";

interface AuthSuccessProps {
  message: ReactNode;
  ctaTo: string;
  ctaLabel: string;
  secondary?: ReactNode;
}

export function AuthSuccess({ message, ctaTo, ctaLabel, secondary }: AuthSuccessProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-sm font-medium text-ink-body">{message}</div>
      <div className="space-y-3">
        <Link to={ctaTo} className="block">
          <Button variant="primary" className="w-full">
            {ctaLabel}
          </Button>
        </Link>
        {secondary && <div className="text-center">{secondary}</div>}
      </div>
    </div>
  );
}
