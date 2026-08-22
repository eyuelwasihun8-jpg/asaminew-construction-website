"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";
import MetricsStrip from "@/components/home/MetricsStrip";
import AboutPreview from "@/components/home/AboutPreview";
import ServicesSection from "@/components/home/ServicesSection";

// 🚀 Client-side only for Firebase sections (prevents SSR errors)
const ProjectsSection = dynamic(() => import("@/components/home/ProjectsSection"), {
  ssr: false,
  loading: () => <div className="h-96 bg-white" />,
});

const GlobalReachSection = dynamic(() => import("@/components/home/GlobalReachSection"), {
  loading: () => <div className="h-96" />,
});

const PartnersSection = dynamic(() => import("@/components/home/PartnersSection"), {
  loading: () => <div className="h-64" />,
});

const TestimonialSection = dynamic(() => import("@/components/home/TestimonialSection"), {
  loading: () => <div className="h-96" />,
});

const CTASection = dynamic(() => import("@/components/home/CTASection"), {
  loading: () => <div className="h-64" />,
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MetricsStrip />
      <AboutPreview />
      <ServicesSection />
      <ProjectsSection />
      <GlobalReachSection />
      <PartnersSection />
      <TestimonialSection />
      <CTASection />
    </>
  );
}