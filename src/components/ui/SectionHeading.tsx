import type { ReactNode } from "react";

interface SectionHeadingProps {
  tag?: string;
  title: ReactNode; // ← Allows both plain strings and JSX elements
  description?: ReactNode;
  align?: "left" | "center" | "right";
  light?: boolean;
  className?: string;
}

export default function SectionHeading({
  tag,
  title,
  description,
  align = "center",
  light = false,
  className = "",
}: SectionHeadingProps) {
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
      ? "text-right"
      : "text-center mx-auto";

  return (
    <div className={`max-w-3xl ${alignClass} ${className}`}>
      {tag && (
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider mb-3 ${
            light
              ? "bg-white/10 text-accent border border-white/15"
              : "bg-primary/5 text-primary border border-primary/15"
          }`}
        >
          {tag}
        </div>
      )}
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            light ? "text-slate-300" : "text-slate-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}