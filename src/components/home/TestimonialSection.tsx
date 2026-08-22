"use client";

import { Quote } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl section-container">
        <AnimateOnScroll>
          <div className="relative glass-white rounded-3xl p-8 sm:p-12 shadow-xl">
            <Quote
              size={48}
              className="absolute -top-5 -left-3 text-accent fill-accent/20"
            />
            <blockquote className="text-xl sm:text-2xl text-slate-800 leading-relaxed font-medium">
              &ldquo;Asaminew Teshome Construction consistently delivers
              quality infrastructure with professional integrity. Their
              engineering expertise and on-site management make them a
              reliable partner for any major project.&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold shadow-lg">
                AT
              </div>
              <div>
                <div className="font-semibold text-slate-900">Industry Partner</div>
                <div className="text-sm text-slate-500">
                  Government & Private Sector Client
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
