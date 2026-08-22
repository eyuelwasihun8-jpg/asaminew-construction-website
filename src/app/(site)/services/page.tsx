import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Building2, Heart, Landmark, Route, Droplets, Truck } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import { companyInfo } from "@/lib/data";
import { images, hasImage } from "@/lib/images";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "Our Services",
  "Comprehensive construction services including commercial building, health centers, bridges, roads, water & dam structures, and machinery import.",
  "/services"
);

const iconMap: Record<string, React.ElementType> = {
  Building2, Heart, Landmark, Route, Droplets, Truck,
};

const detailedServices = [
  {
    title: "Commercial Building Construction",
    icon: "Building2",
    description: "We design and construct state-of-the-art commercial buildings, offices, residential complexes, and institutional structures across Ethiopia.",
    features: ["G+3 to G+5 Office Buildings", "Low-Cost Housing Projects", "School & Educational Facilities", "Pharmaceutical Plants"],
    image: images.services.commercialBuilding,
  },
  {
    title: "Health Center Construction",
    icon: "Heart",
    description: "Specialized in building modern health facilities and hospitals that serve communities across the Oromia region and beyond.",
    features: ["Primary Health Centers", "Hospital Renovation", "Medical Facility Upgrades", "Community Health Posts"],
    image: images.services.healthCenter,
  },
  {
    title: "Bridge Construction",
    icon: "Landmark",
    description: "Expert in constructing medium to large span bridges that connect communities and facilitate transportation.",
    features: ["Medium Span Bridges (30-60m)", "River Crossing Structures", "Reinforced Concrete Bridges", "Steel & Composite Bridges"],
    image: images.services.bridge,
  },
  {
    title: "Road Construction",
    icon: "Route",
    description: "Construction of gravel and asphalt roads connecting cities and rural communities, improving infrastructure.",
    features: ["Asphalt Road Construction", "Gravel Road Projects", "Road Side Corridor Projects", "Urban Road Development"],
    image: images.services.road,
  },
  {
    title: "Water & Dam Structures",
    icon: "Droplets",
    description: "Design and construction of water supply systems, dams, and irrigation infrastructure for development.",
    features: ["Dam Construction", "Irrigation Systems", "Water Supply Networks", "Appurtenance Structures"],
    image: images.services.waterDam,
  },
  {
    title: "Machinery Import",
    icon: "Truck",
    description: companyInfo.machineryImport,
    features: ["Industrial Machineries", "Agricultural Equipment", "Construction Machinery", "Spare Parts & Support"],
    image: images.services.machinery,
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero title="Our Services" breadcrumb="Home" image={images.hero.services} />

      <section className="py-20 bg-white">
        <div className="max-w-4xl section-container text-center">
          <SectionHeading
            tag="What We Offer"
            title="Comprehensive Construction Services"
            description={companyInfo.specialization}
          />
        </div>
      </section>

      <section className="py-10 pb-20 bg-slate-50">
        <div className="section-container space-y-20">
          {detailedServices.map((service, i) => {
            const Icon = iconMap[service.icon] || Building2;
            const isEven = i % 2 === 0;
            const showImage = hasImage(service.image);
            return (
              <AnimateOnScroll key={i}>
                <div className={`grid lg:grid-cols-2 gap-12 items-center`}>
                  <div className={`${!isEven ? "lg:order-2" : ""}`}>
                    <div className="rounded-3xl overflow-hidden shadow-xl">
                      {showImage ? (
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={600}
                          height={400}
                          className="w-full h-72 sm:h-80 object-cover hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-72 sm:h-80 bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center">
                          <Icon size={80} className="text-white/30" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`${!isEven ? "lg:order-1" : ""}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
                        <Icon size={28} className="text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-slate-500 leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((feature, fi) => (
                        <li key={fi} className="flex items-center gap-3">
                          <CheckCircle size={18} className="text-accent shrink-0" />
                          <span className="text-slate-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary via-primary-light to-primary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-dense opacity-15" />
        <AnimateOnScroll>
          <div className="max-w-3xl section-container relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Need Our Services?</h2>
            <p className="text-white/70 text-lg mb-8">{companyInfo.whyUs}</p>
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Request a Quote <ArrowRight size={18} />
            </Link>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}