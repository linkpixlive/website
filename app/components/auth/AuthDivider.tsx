export function AuthDivider({ text = "or" }: { text?: string }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-wash" />
      <span className="text-ink-label text-[11px] uppercase tracking-wider font-extrabold">
        {text}
      </span>
      <div className="flex-1 h-px bg-wash" />
    </div>
  );
}
