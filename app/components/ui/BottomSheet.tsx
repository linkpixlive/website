import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  snapPoints?: ("25%" | "50%" | "75%" | "100%")[];
  defaultSnap?: "25%" | "50%" | "75%" | "100%";
  showHandle?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  snapPoints = ["50%", "100%"],
  defaultSnap = "50%",
  showHandle = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentSnap = useRef(defaultSnap);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleTouchStart = (event: React.TouchEvent) => {
    startY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!contentRef.current) return;
    const y = event.touches[0].clientY;
    const delta = startY.current - y;

    if (delta < 0 && contentRef.current.scrollTop === 0) {
      event.preventDefault();
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  const prefersReducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        prefersReducedMotion ? "" : "animate-fade-in",
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "bottom-sheet-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        className={cn(
          "relative w-full max-h-[90vh] bg-card rounded-t-[26px] shadow-xl flex flex-col overflow-hidden",
          "transition-transform duration-200 ease-out",
          prefersReducedMotion ? "transition-none" : "",
          className,
        )}
        style={{
          transform: `translateY(calc(100% - ${defaultSnap}))`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        tabIndex={-1}
      >
        <div className="flex flex-col gap-2 px-4 py-3 border-b border-line flex-shrink-0">
          <div className="flex items-center justify-between">
            {showHandle && (
              <div className="size-5" aria-hidden="true">
                <div className="w-[36px] h-1.5 bg-line rounded-full mx-auto" />
              </div>
            )}
            {title && (
              <h2 id="bottom-sheet-title" className="text-base font-extrabold text-ink-heading flex-1 text-center">
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-full hover:bg-wash transition-colors text-ink-secondary"
              aria-label="Fechar"
            >
              <Icon name="close-circle" size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
          {children}
        </div>

        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>,
    document.body,
  );
}