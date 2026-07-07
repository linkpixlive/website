export function AuthDivider({ text = "or" }: { text?: string }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-text-muted text-xs uppercase tracking-wider font-medium">
        {text}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
