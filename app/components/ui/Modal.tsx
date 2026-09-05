import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "sm:max-w-[420px]",
  md: "sm:max-w-[560px]",
  lg: "sm:max-w-[720px]",
};

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0" />

        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Dialog.Popup
              className={`relative w-full rounded-[26px] bg-card border border-line p-5 text-left shadow-xl transition-[opacity,scale] duration-200 ease-out sm:my-8 sm:p-6 max-h-[90vh] overflow-y-auto ${sizeStyles[size]} data-starting-style:opacity-0 data-starting-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:scale-[0.96]`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title
                  render={<h3 />}
                  className="text-lg font-extrabold tracking-tight text-ink-heading"
                >
                  {title}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-chrome-icon hover:bg-wash hover:text-ink-heading transition-colors duration-150 outline-none cursor-pointer active:scale-95"
                >
                  <Icon name="close-circle" size={20} strokeWidth={2} />
                </button>
              </div>

              {/* Body */}
              <div className="w-full">{children}</div>
            </Dialog.Popup>
          </div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
