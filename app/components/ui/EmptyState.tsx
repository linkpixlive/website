import { cn } from "~/util/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("py-10 text-center", className)}>
      <h3 className="text-lg font-extrabold tracking-tight text-ink-heading">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-1 max-w-xs text-sm font-medium leading-relaxed text-ink-secondary">
          {description}
        </p>
      )}
    </div>
  );
}
