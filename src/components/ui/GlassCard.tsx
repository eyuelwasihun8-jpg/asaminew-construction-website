"use client";

import { type ReactNode } from "react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "dark" | "light" | "accent";
}

const variants = {
  dark: "glass-card",
  light: "bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-7 transition-all duration-400 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1.5",
  accent: "glass-card rounded-2xl p-7",
};

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  variant = "dark",
}: GlassCardProps) {
  return (
    <AnimateOnScroll delay={delay}>
      <div className={`${variants[variant]} ${className}`}>{children}</div>
    </AnimateOnScroll>
  );
}
