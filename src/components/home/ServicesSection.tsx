import Link from "next/link";
import Image from "next/image";
import { Building2, Heart, Landmark, Route, Droplets, Truck, ArrowRight } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import { services } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  Building2, Heart, Landmark, Route, Droplets, Truck,
};

export default function ServicesSection() {
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      <div className="section-container relative">
        <SectionHeading
          tag="What We Do"
          title="Comprehensive Construction Services"
          description="End-to-end capabilities spanning civil works, infrastructure, and heavy equipment across Ethiopia."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.slice(0, 6).map((service, i) => {
            const Icon = iconMap[service.icon] || Building2;
            return (
              <AnimateOnScroll key={service.id} delay={i * 80}>
                <div className="group bg-white rounded-2xl p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400 border border-slate-100 hover:border-accent/30 cursor-default">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/20 transition-all duration-300">
                      <Icon size={22} className="text-primary group-hover:text-accent transition-colors duration-300" />
                    </div>
                    <span className="text-xs font-mono text-slate-200">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>

        <AnimateOnScroll className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-sm shadow-primary/20"
          >
            View All Services <ArrowRight size={16} />
          </Link>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
