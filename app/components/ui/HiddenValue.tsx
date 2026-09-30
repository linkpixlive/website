import type { ReactNode } from "react";
import { cn } from "~/util/cn";

interface HiddenValueProps {
  visible: boolean;
  children: ReactNode;
  className?: string;
}

export function HiddenValue({ visible, children, className }: HiddenValueProps) {
  return (
    <span className={cn(className, !visible && "blur-sm select-none")}>
      {children}
    </span>
  );
}
