import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Building2 } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import { companyInfo } from "@/lib/data";
import { images, hasImage } from "@/lib/images";

const values = ["Engineering", "Quality", "Integrity", "Safety"];

export default function AboutPreview() {
  const showImage = hasImage(images.about.preview);

  return (
    <section className="py-16 sm:py-20 bg-white overflow-x-hidden">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <AnimateOnScroll animation="animate-fade-in-left">
            <div className="relative mb-8 lg:mb-0">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                {showImage ? (
                  <Image
                    src={images.about.preview}
                    alt="About Asaminew Teshome Construction"
                    width={600}
                    height={400}
                    className="w-full h-72 sm:h-80 lg:h-96 object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-72 sm:h-80 lg:h-96 bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center">
                    <Building2 size={80} className="text-white/30" />
                  </div>
                )}
              </div>

              {/* Years badge */}
              <div className="absolute -bottom-4 right-4 sm:-bottom-6 sm:-right-4 lg:-right-6 glass-elevated rounded-2xl px-5 py-3 sm:px-6 sm:py-4 shadow-xl">
                <div className="text-accent font-bold text-3xl sm:text-4xl leading-none">
                  14+
                </div>
                <div className="text-white/60 text-xs font-medium mt-1">
                  Years of Excellence
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Text */}
          <AnimateOnScroll animation="animate-fade-in-right">
            <div className="min-w-0">
              <SectionHeading
                tag="About Our Company"
                title="Building Ethiopia's Infrastructure with Global Standards"
                align="left"
              />

              {/* ✅ Full text, no substring cut-off, no negative margin overlap */}
              <p className="text-slate-500 leading-relaxed mt-5 mb-6 text-base sm:text-lg break-words">
                {companyInfo.about}
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
                {values.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    <CheckCircle size={13} className="text-accent shrink-0" />
                    {v}
                  </span>
                ))}
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm shadow-primary/20"
              >
                Learn More About Us
                <ArrowRight size={16} />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}