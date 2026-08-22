"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  HardHat,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { images, hasImage } from "@/lib/images";

const highlights = [
  "Quality workmanship with professional diligence",
  "Over 14 years of engineering expertise",
  "Operating across multiple regions in Ethiopia",
  "Comprehensive construction & import services",
];

const trustBadges = [
  "Licensed Contractor",
  "ISO-Aligned Quality",
  "HSE Compliant",
  "Trusted by Government",
];

export default function HeroSection() {
  const showImage = hasImage(images.hero.home);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-primary-dark">
      {/* Background layers - Softened for better image visibility */}
      <div className="absolute inset-0">
        {showImage && (
          <Image
            src={images.hero.home}
            alt="Construction site"
            fill
            className="object-cover opacity-65" /* Increased from 40% to 65% for better visibility */
            priority
            unoptimized
          />
        )}
        {/* Softer gradient overlay: keeps left side dark for text contrast, right side transparent */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 via-primary-dark/60 to-primary-dark/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(8,22,40,0.6),transparent_60%)]" />
      </div>

      <div className="absolute inset-0 grid-bg opacity-15" />

      <div className="absolute top-20 right-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl" />

      <div className="relative z-10 section-container py-20 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-white">
            <div className="inline-flex items-center gap-2 glass-surface rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
              <Sparkles size={13} className="text-accent" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                Building Ethiopia&apos;s Future Since 2010
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] mb-6 tracking-tight animate-fade-in-up opacity-0-start delay-100">
              Engineering
              <br />
              <span className="text-gradient">World-Class</span>
              <br />
              Infrastructure.
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed animate-fade-in-up opacity-0-start delay-200 drop-shadow-sm">
              A trusted Ethiopian construction group delivering buildings, roads,
              bridges, and water works with international standards of quality,
              safety, and engineering excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-fade-in-up opacity-0-start delay-300">
              <Link href="/projects" className="btn-primary inline-flex items-center justify-center gap-2">
                Explore Our Projects
                <ArrowRight size={17} />
              </Link>
              <Link href="/contact" className="btn-glass inline-flex items-center justify-center gap-2">
                Request a Consultation
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-white/15 animate-fade-in-up opacity-0-start delay-400">
              {trustBadges.map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                  <ShieldCheck size={12} className="text-accent" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block animate-fade-in-right opacity-0-start delay-200">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/15 to-primary-light/15 blur-3xl rounded-3xl" />
              <div className="relative glass-elevated rounded-3xl p-8 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Currently Active
                  </span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-1">
                  16+ Projects
                </h3>
                <p className="text-white/60 text-sm mb-6">
                  Successfully delivered across Ethiopia
                </p>

                <div className="space-y-4">
                  {highlights.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-accent/15 border border-accent/25 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle size={14} className="text-accent" />
                      </div>
                      <span className="text-white/90 text-sm leading-relaxed pt-1 font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 pt-6 border-t border-white/10 flex items-center gap-3">
                  <HardHat size={16} className="text-accent" />
                  <span className="text-xs text-white/60">
                    Trusted partner for government & private sector
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}