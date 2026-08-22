import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";
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
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-[0.96]"
              enterTo="opacity-100 scale-100"
              leave="ease-out duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-[0.96]"
            >
              <DialogPanel
                className={`relative w-full transform rounded-[26px] bg-card border border-gray-100/70 p-5 text-left shadow-xl transition-all sm:my-8 sm:p-6 max-h-[90vh] overflow-y-auto animate-scale-in ${sizeStyles[size]}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <DialogTitle as="h3" className="text-lg font-extrabold tracking-tight text-ink-heading">
                    {title}
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1.5 text-chrome-icon hover:bg-wash hover:text-ink-heading transition-colors duration-150 outline-none cursor-pointer active:scale-95"
                  >
                    <Icon name="close-circle" size={20} strokeWidth={2} />
                  </button>
                </div>

                {/* Body */}
                <div className="w-full">
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
