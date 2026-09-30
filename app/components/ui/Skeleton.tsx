interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
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
