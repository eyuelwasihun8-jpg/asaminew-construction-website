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
      document.body.style.overflow = "hidden";
      dialogRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      {/* Backdrop (Dark overlay) */}
      <div
        className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel - Bottom sheet on mobile, centered card on desktop */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-3xl shadow-2xl focus:outline-none animate-slide-up sm:animate-scale-in"
      >
        {/* Mobile Drag Indicator (Visual only, common in premium iOS/Android apps) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden absolute top-0 z-20">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Sticky Header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-6 pt-8 pb-4 sm:py-5 border-b border-slate-100 bg-white/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-3xl z-10">
          {title && (
            <h2 className="flex-1 text-lg sm:text-xl font-bold text-primary truncate pr-2">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors ml-auto"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}