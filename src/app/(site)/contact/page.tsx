"use client";

import { useState, type FormEvent } from "react";
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2, MessageCircle,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useToast } from "@/components/ui/Toast";
import { companyInfo } from "@/lib/data";
import { images } from "@/lib/images";
import { getDb } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

      // ✅ Write DIRECTLY to Firestore — no API route
      const db = getDb();
      const docRef = await addDoc(collection(db, "contacts"), {
        name,
        email,
        phone,
        subject,
        message,
        status: "new",
        createdAt: serverTimestamp(),
      });

      console.log("✅ Contact saved with ID:", docRef.id);

      setSubmitted(true);
      form.reset();
      toast("success", "Your message has been sent successfully!");
    } catch (error) {
      console.error("❌ Contact submit error:", error);
      toast("error", "There was an error sending your message. Please try again.");
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
      <PageHero title="Contact Us" breadcrumb="Home" image={images.hero.contact} />

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
                    <p key={li} className="text-slate-500 text-sm break-all">{line}</p>
                  ))}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12">
            <AnimateOnScroll animation="animate-fade-in-left">
              <div className="glass-white rounded-3xl shadow-xl p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <MessageCircle size={28} className="text-accent" />
                  <div>
                    <h2 className="text-2xl font-bold text-primary">Send Us a Message</h2>
                    <p className="text-slate-500 text-sm">We&apos;ll get back to you within 24 hours</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle size={64} className="text-accent mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-primary mb-3">Message Sent!</h3>
                    <p className="text-slate-500 mb-6">Thank you for reaching out. We will respond shortly.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-primary"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          required
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Email *
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Phone
                        </label>
                        <input
                          id="contact-phone"
                          name="phone"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                          placeholder="+251..."
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Subject *
                        </label>
                        <input
                          id="contact-subject"
                          name="subject"
                          required
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none"
                        placeholder="Write your message..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <><Loader2 size={18} className="animate-spin" /> Sending...</>
                      ) : (
                        <><Send size={18} /> Send Message</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="animate-fade-in-right">
              <div className="glass-white rounded-3xl shadow-xl overflow-hidden h-full min-h-[500px] flex flex-col">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-primary text-lg">Our Location</h3>
                  <p className="text-slate-500 text-sm mt-1">{companyInfo.address}</p>
                </div>
                <div className="flex-1 relative min-h-[400px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.8567455837773!2d38.73!3d8.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: "absolute", inset: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location"
                  />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}