"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  Briefcase, MapPin, Clock, Send, CheckCircle, Upload, Loader2, FileText,
  X, AlertCircle, ArrowUpRight,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import PageHero from "@/components/ui/PageHero";
import { useToast } from "@/components/ui/Toast";
import { images } from "@/lib/images";
import { getDb } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  deadline: string;
}

export default function CareersPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const MAX_CV_SIZE = 5 * 1024 * 1024;

  function validateAndSetCv(file: File | null | undefined) {
    setCvError("");
    if (!file) { setCvFile(null); return; }
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) { setCvError("Only PDF files are accepted."); setCvFile(null); return; }
    if (file.size > MAX_CV_SIZE) { setCvError("Your CV is larger than 5MB."); setCvFile(null); return; }
    setCvFile(file);
  }

  useEffect(() => {
    async function fetchVacancies() {
      try {
        const db = getDb();
        let snap;
        try {
          const q = query(collection(db, "vacancies"), orderBy("createdAt", "desc"));
          snap = await getDocs(q);
        } catch {
          snap = await getDocs(collection(db, "vacancies"));
        }
        // ✅ Only show real vacancies from Firebase — NO hardcoded fallback
        setVacancies(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Vacancy[]
        );
      } catch (err) {
        console.error("Error fetching vacancies:", err);
        setVacancies([]);
      }
      setLoading(false);
    }
    fetchVacancies();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cvFile) {
      setCvError("Please attach your CV in PDF format.");
      fileInputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setCvError("");

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const fullName = String(formData.get("fullName") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const position = String(formData.get("position") || "").trim();
      const experience = String(formData.get("experience") || "").trim();
      const coverLetter = String(formData.get("coverLetter") || "").trim();

      if (!fullName || !email || !phone || !position) {
        toast("error", "Please fill in all required fields.");
        setSubmitting(false);
        return;
      }

      const cvUrl = await uploadToCloudinary(cvFile, "raw", {
        onProgress: (pct) => setUploadProgress(`Uploading CV… ${pct}%`),
      });

      setUploadProgress("Saving application…");
      const db = getDb();
      await addDoc(collection(db, "applications"), {
        fullName, email, phone, position, experience, coverLetter,
        cvUrl,
        cvFileName: cvFile.name,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      form.reset();
      setCvFile(null);
      setSelectedVacancy("");
      setUploadProgress("");
      toast("success", "Your application has been submitted successfully!");
    } catch (error) {
      console.error("❌ Application submit error:", error);
      setUploadProgress("");
      toast("error", "There was an error submitting your application. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <>
      <PageHero
        title={<>Careers & <span className="text-gradient">Vacancies</span></>}
        breadcrumb="Home"
        image={images.hero.careers}
      >
        <p className="text-white/50 mt-2 max-w-2xl mx-auto text-lg">
          Join a team that&apos;s shaping Ethiopia&apos;s infrastructure future.
        </p>
      </PageHero>

      <section className="py-20 bg-white">
        <div className="section-container">
          <AnimateOnScroll className="max-w-2xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-3 py-1 mb-4">
              <Briefcase size={13} className="text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Join Our Team</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">Open Positions</h2>
            <p className="text-slate-500 mt-4 text-lg">Be part of a team that&apos;s building Ethiopia&apos;s future.</p>
          </AnimateOnScroll>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" size={40} /></div>
          ) : vacancies.length === 0 ? (
            <AnimateOnScroll>
              <div className="max-w-md mx-auto text-center py-16">
                <div className="w-20 h-20 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={40} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Open Positions Right Now</h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  We don&apos;t have any vacancies at the moment. You can still send a general application below, or check back later.
                </p>
                <button
                  onClick={() => {
                    setSelectedVacancy("Other");
                    document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-primary"
                >
                  Send General Application
                </button>
              </div>
            </AnimateOnScroll>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vacancies.map((vacancy, i) => (
                <AnimateOnScroll key={vacancy.id} delay={i * 80}>
                  <div className="group bg-white rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-400 border border-slate-200 hover:border-accent/30 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center group-hover:bg-accent/10 transition-all">
                        <Briefcase size={22} className="text-primary group-hover:text-accent transition-colors" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-200">0{i + 1}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{vacancy.title}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">{vacancy.department}</p>
                    <p className="text-slate-500 text-sm mb-4 flex-1">{vacancy.description}</p>
                    <div className="space-y-2 text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2"><MapPin size={13} className="text-accent" />{vacancy.location}</div>
                      <div className="flex items-center gap-2"><Clock size={13} className="text-accent" />{vacancy.type}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVacancy(vacancy.title);
                        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm shadow-primary/20 inline-flex items-center justify-center gap-1.5"
                    >
                      Apply for this role <ArrowUpRight size={14} />
                    </button>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="apply-form" className="py-20 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />

        <div className="relative max-w-3xl section-container">
          <AnimateOnScroll className="text-center mb-10">
            <div className="inline-flex items-center gap-2 glass-surface rounded-full px-3 py-1 mb-4">
              <Send size={13} className="text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Apply Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 leading-tight">Submit Your Application</h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto">All applications are reviewed by our HR team within 5 business days.</p>
          </AnimateOnScroll>

          {submitted ? (
            <AnimateOnScroll>
              <div className="glass rounded-3xl p-12 text-center">
                <CheckCircle size={64} className="text-accent mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Application Submitted!</h3>
                <p className="text-white/60">Thank you for your interest. We will review your application and get back to you soon.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 btn-primary">Submit Another</button>
              </div>
            </AnimateOnScroll>
          ) : (
            <AnimateOnScroll>
              <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 sm:p-10 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="app-name" className="block text-sm font-medium text-white/80 mb-2">Full Name *</label>
                    <input id="app-name" name="fullName" required className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-white/30" placeholder="Your full name" />
                  </div>
                  <div>
                    <label htmlFor="app-email" className="block text-sm font-medium text-white/80 mb-2">Email *</label>
                    <input id="app-email" name="email" type="email" required className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-white/30" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="app-phone" className="block text-sm font-medium text-white/80 mb-2">Phone *</label>
                    <input id="app-phone" name="phone" required className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-white/30" placeholder="+251..." />
                  </div>
                  <div>
                    <label htmlFor="app-position" className="block text-sm font-medium text-white/80 mb-2">Position *</label>
                    <select id="app-position" name="position" required value={selectedVacancy} onChange={(e) => setSelectedVacancy(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-white">
                      <option value="" className="text-black">Select a position</option>
                      {vacancies.map((v) => (<option key={v.id} value={v.title} className="text-black">{v.title}</option>))}
                      <option value="Other" className="text-black">Other / General application</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="app-experience" className="block text-sm font-medium text-white/80 mb-2">Years of Experience</label>
                  <input id="app-experience" name="experience" className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-white/30" placeholder="e.g., 5 years" />
                </div>
                <div>
                  <label htmlFor="app-cover" className="block text-sm font-medium text-white/80 mb-2">Cover Letter</label>
                  <textarea id="app-cover" name="coverLetter" rows={4} className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-white/30 resize-none" placeholder="Tell us about yourself..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Upload CV (PDF only, max 5MB) *</label>
                  {!cvFile ? (
                    <label
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); validateAndSetCv(e.dataTransfer.files?.[0]); }}
                      className={`flex items-center gap-4 glass-input border-2 border-dashed rounded-xl px-5 py-5 cursor-pointer hover:bg-white/10 transition-all ${isDragging ? "border-accent bg-accent/10" : ""}`}
                    >
                      <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center shrink-0">
                        <Upload size={22} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{isDragging ? "Drop your CV here" : "Click to upload or drag and drop"}</div>
                        <div className="text-white/40 text-xs mt-1">PDF format only · up to 5MB</div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => validateAndSetCv(e.target.files?.[0])} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-4 glass-input rounded-xl px-5 py-4">
                      <div className="w-11 h-11 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={22} className="text-red-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{cvFile.name}</div>
                        <div className="text-white/40 text-xs mt-0.5">{(cvFile.size / 1024).toFixed(0)} KB · PDF</div>
                      </div>
                      <button type="button" onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Remove file">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  {cvError && (
                    <div className="mt-2 flex items-start gap-2 text-red-300 text-xs">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" /><span>{cvError}</span>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? (<><Loader2 size={18} className="animate-spin" /> {uploadProgress || "Submitting..."}</>) : (<><Send size={18} /> Submit Application</>)}
                </button>
              </form>
            </AnimateOnScroll>
          )}
        </div>
      </section>
    </>
  );
}