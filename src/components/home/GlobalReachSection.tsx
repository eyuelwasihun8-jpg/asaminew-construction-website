"use client";

import { Globe2, MapPin } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";

const globalReach = [
  { region: "Addis Ababa", projects: "8+" },
  { region: "Oromia", projects: "4+" },
  { region: "Amhara", projects: "2+" },
  { region: "SNNPR", projects: "2+" },
];

export default function GlobalReachSection() {
  return (
    <section className="py-20 bg-primary-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl" />

      <div className="relative section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll>
            <SectionHeading
              tag="Our Footprint"
              title={<>Operating Across<br /><span className="text-gradient">Multiple Regions</span><br />of Ethiopia</>}
              description="From headquarters in Addis Ababa, we deliver projects across the country with regional teams, local partners, and on-site engineering presence."
              align="left"
              light
            />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <div className="grid grid-cols-2 gap-3">
              {globalReach.map((r, i) => (
                <div
                  key={r.region}
                  className="glass-card rounded-2xl p-5 cursor-default"
                >
                  <div className="flex items-center justify-between mb-3">
                    <MapPin size={18} className="text-accent" />
                    <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                      Region {i + 1}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white">{r.region}</div>
                  <div className="text-xs text-white/40 mt-1">
                    {r.projects} projects delivered
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
