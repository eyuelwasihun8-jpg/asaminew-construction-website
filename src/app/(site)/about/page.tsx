import Image from "next/image";
import { Target, Eye, Users, Award, Shield, Lightbulb, User } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import { companyInfo } from "@/lib/data";
import { images, hasImage } from "@/lib/images";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "About Us",
  "Learn about Asaminew Teshome Construction - Professional construction company with over 14 years of experience in building, roads, bridges, and water works across Ethiopia.",
  "/about"
);

export default function AboutPage() {
  const showStory = hasImage(images.about.story);
  const showCeo = hasImage(images.about.ceo);

  return (
    <>
      <PageHero title="About Us" breadcrumb="Home" image={images.hero.about} />

      {/* Company Story */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimateOnScroll animation="animate-fade-in-left">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  {showStory ? (
                    <Image
                      src={images.about.story}
                      alt="Our Story"
                      width={600}
                      height={450}
                      className="w-full h-96 object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center">
                      <Award size={80} className="text-white/30" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-6 -left-6 glass-elevated rounded-2xl px-6 py-4 text-white shadow-xl">
                  <div className="font-bold text-3xl text-accent">14+</div>
                  <div className="text-white/60 text-sm">Years Experience</div>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="animate-fade-in-right">
              <div>
                <span className="text-accent font-semibold text-sm uppercase tracking-wider">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-primary mt-2 mb-6">
                  Who We Are
                </h2>
                {companyInfo.about.split("\n\n").map((para, i) => (
                  <p key={i} className="text-slate-500 leading-relaxed mb-4">
                    {para}
                  </p>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CEO Section */}
      <section className="py-20 bg-slate-50">
        <div className="section-container">
          <SectionHeading tag="Leadership" title="Our Founder & CEO" />

          <AnimateOnScroll>
            <div className="max-w-3xl mx-auto glass-white rounded-3xl shadow-xl overflow-hidden">
              <div className="grid sm:grid-cols-2 items-center">
                <div className="relative h-72 sm:h-full min-h-[280px]">
                  {showCeo ? (
                    <Image
                      src={images.about.ceo}
                      alt="Eng. Asaminew Teshome Assefa"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                      <User size={80} className="text-white/30" />
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-primary mb-1">
                    Eng. Asaminew Teshome Assefa
                  </h3>
                  <p className="text-accent font-semibold mb-4">Founder & CEO</p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    A Professional Engineer with more than 14 years of working
                    experience in Building, Road and Bridge and Irrigation &amp;
                    Water Supply System design and construction, civil works
                    contract administration and construction supervision.
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative section-container">
          <SectionHeading
            tag="What Drives Us"
            title="Mission, Vision & Values"
            light
          />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Our Mission", text: companyInfo.mission },
              { icon: Eye, title: "Our Vision", text: companyInfo.vision },
              { icon: Users, title: "Core Values", text: companyInfo.coreValue },
            ].map((item, i) => (
              <AnimateOnScroll key={i} delay={i * 200}>
                <div className="glass-card rounded-2xl p-8 h-full text-center cursor-default">
                  <div className="w-16 h-16 bg-accent/15 border border-accent/25 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <item.icon size={32} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-accent">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">{item.text}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <SectionHeading tag="Our Principles" title="What We Stand For" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Integrity", desc: "We maintain the highest ethical standards in all our dealings and operations." },
              { icon: Award, title: "Quality", desc: "We deliver workmanship that meets and exceeds the required standards of the country." },
              { icon: Lightbulb, title: "Innovation", desc: "We foster a climate which encourages innovation and diligence among our team." },
              { icon: Users, title: "Teamwork", desc: "We respect each other's perspective and share knowledge and resources." },
              { icon: Target, title: "Professionalism", desc: "Our professional diligence drives us to deliver exceptional results on every project." },
              { icon: Eye, title: "Client Focus", desc: "We strive to meet and exceed client expectations through impeccable services." },
            ].map((value, i) => (
              <AnimateOnScroll key={i} delay={i * 100}>
                <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-400 hover:-translate-y-1 border border-slate-100 cursor-default">
                  <value.icon size={36} className="text-accent mb-4" />
                  <h3 className="text-lg font-bold text-primary mb-3">{value.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}