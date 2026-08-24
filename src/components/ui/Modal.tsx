"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleKeyDown);
      
      // Lock scroll without layout shift
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      dialogRef.current?.focus();

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
        previousFocus.current?.focus();
      };
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      {/* Full Screen Backdrop */}
      <div
        className="absolute inset-0 bg-primary-dark/70 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="
          relative z-[101] flex flex-col w-full bg-white
          max-h-[min(92dvh,100%)]
          rounded-t-[28px] sm:rounded-3xl
          sm:max-w-2xl sm:max-h-[85vh] sm:mx-auto
          shadow-2xl focus:outline-none
          animate-slide-up sm:animate-scale-in
        "
        style={{
          // Prevents bottom content from being cut off by iPhone home bar
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-6 py-3 sm:py-5 border-b border-slate-100 bg-white rounded-t-[28px] sm:rounded-t-3xl">
          {title && (
            <h2 className="flex-1 min-w-0 text-[17px] sm:text-lg font-bold text-primary truncate pr-2">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all ml-auto"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body - Ensures inner content scrolls without pushing footer out */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}