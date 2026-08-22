import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 border-4 border-accent rounded-full" />
      </div>
      <div className="absolute inset-0 grid-bg-dense opacity-20" />

      <div className="relative max-w-4xl section-container text-center">
        <AnimateOnScroll>
          <div className="inline-flex items-center gap-2 glass-surface rounded-full px-4 py-1.5 mb-4">
            <Sparkles size={13} className="text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Let&apos;s Build Together
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Build Your Next Project?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Bring your construction vision to life with a partner that combines
            local expertise with international standards of excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              Start a Conversation
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/careers"
              className="btn-glass inline-flex items-center justify-center gap-2"
            >
              Join Our Team
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
