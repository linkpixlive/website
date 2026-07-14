interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-secondary/60 animate-pulse rounded-md ${className}`}
      {...props}
    />
  );
}
