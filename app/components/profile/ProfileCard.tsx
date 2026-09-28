import type { ReactNode } from "react";
import {
  CARD_CLASS,
  SECTION_HEADING_CLASS,
} from "~/components/ui/classes";
import { cn } from "~/util/cn";

export function ProfileCard({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={label}
      className={cn(CARD_CLASS, "flex flex-col", className)}
    >
      <h2 className={cn(SECTION_HEADING_CLASS, "mb-4")}>{label}</h2>
      {children}
    </section>
  );
}
