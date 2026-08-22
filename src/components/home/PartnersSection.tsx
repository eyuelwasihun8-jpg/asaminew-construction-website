import AnimateOnScroll from "@/components/AnimateOnScroll";

const partners = [
  "Government of Ethiopia",
  "Ministry of Health",
  "Ministry of Transport",
  "Ethiopian Roads Authority",
  "Regional Bureaus",
  "International NGOs",
];

export default function PartnersSection() {
  return (
    <section className="py-14 bg-white border-y border-slate-100">
      <div className="section-container">
        <AnimateOnScroll>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Trusted by leading organizations
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4 items-center">
            {partners.map((p) => (
              <div
                key={p}
                className="text-center text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors py-3 border border-transparent hover:border-slate-200 rounded-xl"
              >
                {p}
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
