import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { images, hasImage } from "@/lib/images";

interface PageHeroProps {
  title: React.ReactNode;
  breadcrumb: string;
  image?: string;
  children?: React.ReactNode;
}

export default function PageHero({
  title,
  breadcrumb,
  image = images.hero.home,
  children,
}: PageHeroProps) {
  const showImage = hasImage(image);

  return (
    <section className="relative h-72 sm:h-80 lg:h-96 flex items-center justify-center overflow-hidden bg-primary-dark">
      <div className="absolute inset-0">
        {showImage ? (
          <Image
            src={image}
            alt={typeof title === "string" ? title : "Page hero"}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          // Elegant gradient fallback when no image is set
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/90 via-primary-dark/70 to-primary-dark/85" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.08),transparent_60%)]" />
      </div>
      <div className="relative z-10 text-center text-white px-4">
        <div className="inline-flex items-center gap-1.5 glass-surface rounded-full px-4 py-1.5 mb-5 animate-fade-in-up">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {breadcrumb}
          </span>
          <ChevronRight size={12} className="text-white/40" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold animate-fade-in-up opacity-0-start delay-100">
          {title}
        </h1>
        {children && (
          <div className="mt-4 animate-fade-in-up opacity-0-start delay-200">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}