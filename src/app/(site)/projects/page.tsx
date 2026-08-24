"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  MapPin,
  User,
  Search,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Clock,
  FolderOpen,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Target,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import PageHero from "@/components/ui/PageHero";
import Modal from "@/components/ui/Modal";
import { images, hasImage } from "@/lib/images";
import { getDb } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  scope: string;
  category: string;
  status?: "in-progress" | "completed" | "planning";
  progress?: number;
  image?: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  images?: string[];
}

const categories = [
  { key: "all", label: "All Categories" },
  { key: "building", label: "Buildings" },
  { key: "health", label: "Health Centers" },
  { key: "bridge", label: "Bridges" },
  { key: "road", label: "Roads" },
  { key: "water", label: "Water & Dam" },
];

const statusFilters = [
  { key: "all", label: "All Projects" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

function getProjectImages(p: Project): string[] {
  if (p.images && p.images.length > 0) return p.images.filter((u) => hasImage(u));
  return [p.imageUrl || p.image, p.imageUrl2, p.imageUrl3].filter((u): u is string => hasImage(u));
}

function ImageCarousel({ urls, alt, className = "aspect-video sm:h-56", rounded = "" }: { urls: string[]; alt: string; className?: string; rounded?: string; }) {
  const [index, setIndex] = useState(0);
  const total = urls.length;

  const prev = useCallback((e?: React.MouseEvent) => { e?.stopPropagation(); setIndex((i) => (i - 1 + total) % total); }, [total]);
  const next = useCallback((e?: React.MouseEvent) => { e?.stopPropagation(); setIndex((i) => (i + 1) % total); }, [total]);

  if (total === 0) {
    return (
      <div className={`relative w-full ${className} bg-slate-100 flex items-center justify-center ${rounded}`}>
        <ImageIcon size={48} className="text-slate-300" />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className} overflow-hidden ${rounded} group/carousel`}>
      {urls.map((url, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === index ? "opacity-100 z-[1]" : "opacity-0 z-0"}`}>
          <Image src={url} alt={`${alt} — photo ${i + 1}`} fill className="object-cover" unoptimized loading={i === 0 ? "eager" : "lazy"} />
        </div>
      ))}
      {total > 1 && (
        <>
          <button type="button" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-[2] w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 md:group-hover/carousel:opacity-100 transition-opacity"><ChevronLeft size={18} /></button>
          <button type="button" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-[2] w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 md:group-hover/carousel:opacity-100 transition-opacity"><ChevronRight size={18} /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[2] flex items-center gap-1.5">
            {urls.map((_, i) => (
              <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setIndex(i); }} className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? "bg-white w-4" : "bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalImgIndex, setModalImgIndex] = useState(0);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const db = getDb();
        let snap;
        try {
          snap = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc")));
        } catch {
          snap = await getDocs(collection(db, "projects"));
        }
        const firebaseProjects = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return { id: docSnap.id, ...d, status: d.status || "completed", progress: typeof d.progress === "number" ? d.progress : 100 };
        }) as Project[];
        setProjects(firebaseProjects);
      } catch (err) { console.error("Error fetching projects:", err); setProjects([]); }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  useEffect(() => setModalImgIndex(0), [selectedProject?.id]);

  const filtered = projects.filter((p) => {
    return (activeCategory === "all" || p.category === activeCategory) && (activeStatus === "all" || (p.status || "completed") === activeStatus);
  });

  return (
    <>
      <PageHero title="Our Projects Portfolio" breadcrumb="Home" image={images.hero.projects} />

      {/* Sticky Filters */}
      <section className="py-4 sm:py-6 bg-white sticky top-[4.5rem] sm:top-20 z-30 shadow-sm border-b border-slate-100">
        <div className="section-container space-y-3 sm:space-y-4">
          <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-2 border-b border-slate-100 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {statusFilters.map((st) => (
              <button key={st.key} onClick={() => setActiveStatus(st.key)} className={`shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${activeStatus === st.key ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{st.label}</button>
            ))}
          </div>
          <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory === cat.key ? "bg-accent text-primary-dark shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"}`}>{cat.label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 bg-slate-50 min-h-[50vh]">
        <div className="section-container">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" size={40} /></div>
          ) : projects.length === 0 ? (
            <AnimateOnScroll>
              <div className="max-w-md mx-auto text-center py-16 px-4">
                <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6"><FolderOpen size={40} className="text-accent" /></div>
                <h3 className="text-2xl font-bold text-primary mb-3">No Projects Yet</h3>
                <p className="text-slate-500 leading-relaxed">Our portfolio is being updated.</p>
              </div>
            </AnimateOnScroll>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((project, i) => {
                const imgs = getProjectImages(project);
                const isCompleted = project.status === "completed";
                const isInProgress = project.status === "in-progress";
                const progressPct = project.progress ?? (isCompleted ? 100 : 50);

                return (
                  <AnimateOnScroll key={project.id} delay={i * 50}>
                    <button onClick={() => setSelectedProject(project)} className="w-full text-left bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-slate-100 flex flex-col h-full">
                      <div className="relative p-2 pb-0">
                        <ImageCarousel urls={imgs.length ? imgs : hasImage(images.fallback.project) ? [images.fallback.project] : []} alt={project.name} className="aspect-[4/3] rounded-[18px]" />
                        <span className={`absolute top-5 left-5 z-[3] text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-sm backdrop-blur-md ${isCompleted ? "bg-emerald-500/90 text-white" : isInProgress ? "bg-amber-500/90 text-white" : "bg-slate-800/90 text-white"}`}>
                          {isCompleted ? <CheckCircle2 size={14} /> : isInProgress ? <TrendingUp size={14} /> : <Clock size={14} />}
                          {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Planning"}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                        <div className="min-w-0 mb-4">
                          <h3 className="font-bold text-primary text-lg mb-3 break-words leading-snug group-hover:text-accent transition-colors">{project.name}</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5 text-slate-500 text-sm min-w-0"><User size={16} className="text-slate-400 shrink-0" /><span className="truncate">{project.client}</span></div>
                            <div className="flex items-center gap-2.5 text-slate-500 text-sm min-w-0"><MapPin size={16} className="text-slate-400 shrink-0" /><span className="truncate">{project.location}</span></div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100/80 w-full min-w-0">
                          <div className="flex justify-between items-center text-xs font-semibold mb-2">
                            <span className="text-slate-400 uppercase tracking-wide">Progress</span>
                            <span className={isCompleted ? "text-emerald-600" : "text-amber-600"}>{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-amber-400 to-amber-500"}`} style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }} />
                          </div>
                        </div>
                      </div>
                    </button>
                  </AnimateOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <Modal open={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.name}>
        {selectedProject && (
          <div className="pb-12 sm:pb-8">
            
            {/* Modal Image Carousel */}
            {(() => {
              const modalImgs = getProjectImages(selectedProject);
              const displayImgs = modalImgs.length > 0 ? modalImgs : hasImage(images.fallback.project) ? [images.fallback.project] : [];
              const total = displayImgs.length;

              return (
                <div className="relative w-full aspect-[4/3] sm:aspect-video bg-slate-100 overflow-hidden">
                  {displayImgs.length > 0 ? (
                    displayImgs.map((url, i) => (
                      <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === modalImgIndex ? "opacity-100 z-[1]" : "opacity-0 z-0"}`}>
                        <Image src={url} alt={`${selectedProject.name} ${i + 1}`} fill className="object-cover" unoptimized />
                      </div>
                    ))
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center"><ImageIcon size={40} className="text-slate-300" /></div>
                  )}

                  {/* Badges */}
                  <span className="absolute bottom-4 left-4 z-[3] glass-elevated text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide">{selectedProject.category}</span>
                  {total > 1 && (
                    <span className="absolute top-4 right-4 z-[3] glass-elevated text-white text-[11px] font-bold px-3 py-1 rounded-full">{modalImgIndex + 1} / {total}</span>
                  )}
                  {total > 1 && (
                    <>
                      <button onClick={() => setModalImgIndex((i) => (i - 1 + total) % total)} className="absolute left-3 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all"><ChevronLeft size={24} /></button>
                      <button onClick={() => setModalImgIndex((i) => (i + 1) % total)} className="absolute right-3 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all"><ChevronRight size={24} /></button>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Thumbnail Strip */}
            {getProjectImages(selectedProject).length > 1 && (
              <div className="flex gap-3 px-5 sm:px-6 py-4 overflow-x-auto scrollbar-hide">
                {getProjectImages(selectedProject).map((url, i) => (
                  <button key={i} onClick={() => setModalImgIndex(i)} className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all ${i === modalImgIndex ? "ring-2 ring-accent ring-offset-2 opacity-100" : "opacity-60 hover:opacity-100"}`}>
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}

            {/* Content Details */}
            <div className="px-5 sm:px-6 pt-2 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Project Status</span>
                    <span className="flex items-center gap-2 font-bold text-slate-800 text-base sm:text-lg">
                      {selectedProject.status === "completed" ? <CheckCircle2 className="text-emerald-500" size={20} /> : selectedProject.status === "in-progress" ? <TrendingUp className="text-amber-500" size={20} /> : <Clock className="text-slate-500" size={20} />}
                      <span className="capitalize">{selectedProject.status === "in-progress" ? "In Progress" : selectedProject.status === "planning" ? "Planning" : "Completed"}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${selectedProject.status === "completed" ? "text-emerald-600" : "text-amber-500"}`}>{selectedProject.progress ?? 100}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-700 ${selectedProject.status === "completed" ? "bg-emerald-500" : "bg-gradient-to-r from-amber-400 to-amber-500"}`} style={{ width: `${Math.min(100, Math.max(0, selectedProject.progress ?? 100))}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="p-3 bg-accent/10 rounded-xl shrink-0"><User size={20} className="text-accent" /></div>
                  <div className="min-w-0">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Client</span>
                    <p className="text-slate-800 font-semibold text-sm mt-0.5 truncate">{selectedProject.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="p-3 bg-accent/10 rounded-xl shrink-0"><MapPin size={20} className="text-accent" /></div>
                  <div className="min-w-0">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Location</span>
                    <p className="text-slate-800 font-semibold text-sm mt-0.5 truncate">{selectedProject.location}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={18} className="text-slate-400" />
                  <h4 className="text-base font-bold text-slate-900">Project Scope</h4>
                </div>
                <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-wrap">{selectedProject.scope}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}