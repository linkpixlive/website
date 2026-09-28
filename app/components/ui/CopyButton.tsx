import { useEffect } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { cn } from "~/util/cn";

interface CopyButtonProps {
  /** pill = faixa full-width · icon = botão circular · inline = só ícone. */
  variant: "pill" | "icon" | "inline";
  /** Texto copiado para o clipboard. */
  text: string;
  children: ReactNode;
  copiedChildren?: ReactNode;
  /** title (icon) / aria-label (inline). */
  label?: string;
  copiedLabel?: string;
  className?: string;
  /** Espelho do estado (ex.: legenda "Copiado!" fora do botão). */
  onStatusChange?: (copied: boolean) => void;
}

/** Botão de copiar com estado "Copiado!" temporizado (via useCopyToClipboard). */
export function CopyButton({
  variant,
  text,
  children,
  copiedChildren,
  label,
  copiedLabel,
  className,
  onStatusChange,
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  const content = copied ? (copiedChildren ?? children) : children;
  const title = copied ? (copiedLabel ?? label) : label;

  useEffect(() => {
    onStatusChange?.(copied);
  }, [copied, onStatusChange]);

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={() => void copy(text)}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-wash hover:bg-wash-hover text-xs font-bold text-ink-body transition-colors duration-150 cursor-pointer outline-none active:scale-[0.98]",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => void copy(text)}
        title={title}
        className={cn(
          "w-11 h-11 rounded-full border shadow-xs transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95",
          copied
            ? "bg-success/10 border-success/20 text-success"
            : "bg-card hover:bg-tile border-line text-chrome-icon",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void copy(text)}
      aria-label={title}
      className={cn(
        "shrink-0 p-1 rounded-full text-chrome-icon hover:bg-wash transition-colors duration-150 outline-none cursor-pointer active:scale-95",
        className,
      )}
    >
      {content}
    </button>
  );
}
