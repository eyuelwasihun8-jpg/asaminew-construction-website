"use client";

import { useState, type FormEvent } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  MessageCircle,
  ExternalLink,
  Navigation,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useToast } from "@/components/ui/Toast";
import { companyInfo } from "@/lib/data";
import { images } from "@/lib/images";
import { getDb } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/** Opens full Google Maps (app / desktop) — same place as second screenshot */
const MAPS_LINK = "https://maps.app.goo.gl/cMgfksvbLqxD2CE38";

/**
 * Street-level embed for Asaminew Teshome Construction
 * Coords from Google place: 8.9523152, 38.728876
 * Place: 0x164b815030e3d6e3:0x1c398eb2602e3b2b
 */
const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.15!2d38.7263!3d8.9523152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b815030e3d6e3%3A0x1c398eb2602e3b2b!2sAsaminew%20Teshome%20Construction!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !subject || !message) {
        toast("error", "Please fill in all required fields.");
        setSubmitting(false);
        return;
      }

      const db = getDb();
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        phone,
        subject,
        message,
        status: "new",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      form.reset();
      toast("success", "Your message has been sent successfully!");
    } catch (error) {
      console.error("Contact submit error:", error);
      toast(
        "error",
        "There was an error sending your message. Please try again."
      );
    }
    setSubmitting(false);
  }

  const contactDetails = [
    { icon: Phone, title: "Phone", lines: companyInfo.phone },
    { icon: Mail, title: "Email", lines: [companyInfo.email] },
    { icon: MapPin, title: "Address", lines: [companyInfo.address] },
    { icon: Clock, title: "Working Hours", lines: [companyInfo.hours] },
  ];

  return (
    <>
      <PageHero
        title="Contact Us"
        breadcrumb="Home"
        image={images.hero.contact}
      />

      {/* Info cards */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-24 relative z-20">
            {contactDetails.map((item, i) => (
              <AnimateOnScroll key={i} delay={i * 100}>
                <div className="glass-elevated rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-400 hover:-translate-y-1 h-full">
                  <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon size={28} className="text-accent" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">{item.title}</h3>
                  {item.lines.map((line, li) => (
                    <p key={li} className="text-slate-500 text-sm break-words">
                      {line}
                    </p>
                  ))}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-20 bg-slate-50">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Form */}
            <AnimateOnScroll animation="animate-fade-in-left">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 lg:p-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <MessageCircle size={24} className="text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-primary">
                      Send Us a Message
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      We&apos;ll get back to you within 24 hours
                    </p>
                  </div>
                </div>

                {submitted ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <CheckCircle size={64} className="text-accent mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-primary mb-3">
                      Message Sent!
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-sm">
                      Thank you for reaching out. We will respond shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="btn-primary"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5 flex-1 flex flex-col"
                  >
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          required
                          autoComplete="name"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-white"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Email *
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-white"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Phone
                        </label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-white"
                          placeholder="+251..."
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-subject"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Subject *
                        </label>
                        <input
                          id="contact-subject"
                          name="subject"
                          required
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-white"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label
                        htmlFor="contact-message"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
                        className="w-full flex-1 min-h-[140px] border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none bg-white"
                        placeholder="Write your message..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 mt-auto"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </AnimateOnScroll>

            {/* Map — full height street map + pin (like Google Maps place view) */}
            <AnimateOnScroll animation="animate-fade-in-right">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full min-h-[560px]">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 shrink-0">
                  <div className="min-w-0">
                    <h3 className="font-bold text-primary text-lg flex items-center gap-2">
                      <MapPin size={20} className="text-accent shrink-0" />
                      Our Location
                    </h3>
                    <p className="text-slate-500 text-sm mt-1.5 leading-relaxed break-words">
                      {companyInfo.address}
                    </p>
                  </div>

                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2.5 rounded-xl bg-accent text-primary-dark text-sm font-bold shadow-md shadow-accent/25 hover:bg-accent-light active:scale-[0.98] transition-all"
                  >
                    <Navigation size={16} />
                    Get Directions
                    <ExternalLink size={14} className="opacity-70" />
                  </a>
                </div>

                {/* Map fills the card — min height so it never collapses */}
                <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] bg-slate-100">
                  <iframe
                    src={MAP_EMBED_SRC}
                    title="Asaminew Teshome Construction location"
                    className="absolute inset-0 block w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <p className="text-xs text-slate-500 font-medium">
                    Asaminew Teshome Construction
                  </p>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent font-semibold hover:underline inline-flex items-center gap-1.5"
                  >
                    Open in Google Maps
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}