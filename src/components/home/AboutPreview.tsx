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
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimateOnScroll animation="animate-fade-in-left">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                {showImage ? (
                  <Image
                    src={images.about.preview}
                    alt="About Asaminew Teshome Construction"
                    width={600}
                    height={400}
                    className="w-full h-80 sm:h-96 object-cover"
                    unoptimized
                  />
                ) : (
                  // Placeholder when image not uploaded yet
                  <div className="w-full h-80 sm:h-96 bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center">
                    <Building2 size={80} className="text-white/30" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -right-6 glass-elevated rounded-2xl px-6 py-4 shadow-xl">
                <div className="text-accent font-bold text-4xl leading-none">14+</div>
                <div className="text-white/60 text-xs font-medium mt-1">Years of Excellence</div>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="animate-fade-in-right">
            <div>
              <SectionHeading
                tag="About Our Company"
                title="Building Ethiopia's Infrastructure with Global Standards"
                align="left"
              />
              <p className="text-slate-500 leading-relaxed mb-6 text-lg -mt-8">
                {companyInfo.about.substring(0, 320)}…
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {values.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    <CheckCircle size={13} className="text-accent" />
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