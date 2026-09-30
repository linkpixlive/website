interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** Fundo do bloco: `wash` (padrão) ou `card` (skeleton sobre fundo wash). */
  tone?: "wash" | "card";
}

export function Skeleton({ className = "", tone = "wash", ...props }: SkeletonProps) {
  return (
    <div
      className={`${tone === "card" ? "bg-card" : "bg-wash"} animate-pulse rounded-xl ${className}`}
      {...props}
    />
  );
}
