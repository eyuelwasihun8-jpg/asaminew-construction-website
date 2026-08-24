"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Optional subtitle shown below title in sticky header */
  subtitle?: string;
  /** Optional badge shown in sticky header (e.g., category) */
  badge?: string;
  /** Max width preset */
  size?: "md" | "lg" | "xl";
}

const sizeMap = {
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
};

export default function Modal({
  open,
  onClose,
  children,
  title,
  subtitle,
  badge,
  size = "lg",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const scrollY = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    // Save current scroll position
    scrollY.current = window.scrollY;
    previousFocus.current = document.activeElement as HTMLElement;

    // Fully lock scroll (works on iOS Safari too)
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY.current);
      previousFocus.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      {/* Backdrop — blurred + darkened + blocks all pointer events on background */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in-up"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white w-full ${sizeMap[size]} h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl overflow-hidden shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] focus:outline-none flex flex-col animate-scale-in ring-1 ring-slate-200/50`}
      >
        {/* Elegant sticky header */}
        {(title || badge) && (
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-slate-100">
            {/* Gold accent line at very top */}
            <div className="h-1 bg-gradient-to-r from-accent via-accent-light to-accent" />

            <div className="flex items-start gap-3 px-5 sm:px-8 py-4">
              <div className="flex-1 min-w-0">
                {badge && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-accent bg-accent/10 px-2.5 py-1 rounded-md mb-2">
                    {badge}
                  </span>
                )}
                {title && (
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 break-words leading-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors group"
                aria-label="Close dialog"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}