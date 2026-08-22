"use client";

import { Award, Briefcase, Users, TrendingUp } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const metrics = [
  { value: "14+", label: "Years of Excellence", icon: Award },
  { value: "16+", label: "Projects Delivered", icon: Briefcase },
  { value: "50+", label: "Engineering Team", icon: Users },
  { value: "7+", label: "Regions Served", icon: TrendingUp },
];

export default function MetricsStrip() {
  return (
    <section className="relative -mt-12 z-20 pb-16">
      <div className="section-container">
        <div className="glass-elevated rounded-2xl p-8 sm:p-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 lg:divide-x lg:divide-white/10">
            {metrics.map((m, i) => (
              <AnimateOnScroll key={i} delay={i * 80}>
                <div className="flex flex-col items-center text-center px-3 group">
                  <div className="w-12 h-12 bg-accent/15 border border-accent/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/25 group-hover:border-accent/50 transition-all duration-300">
                    <m.icon size={22} className="text-accent" />
                  </div>
                  {/* Number - gold accent color */}
                  <div className="text-4xl sm:text-5xl font-bold text-accent tabular-nums leading-none mb-3 tracking-tight">
                    {m.value}
                  </div>
                  {/* Label - clean light grey, clearly visible */}
                  <div className="text-xs sm:text-sm text-slate-300 uppercase tracking-widest font-semibold">
                    {m.label}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}