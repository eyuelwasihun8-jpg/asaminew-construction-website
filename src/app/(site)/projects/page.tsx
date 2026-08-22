"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, User, Search, Loader2, TrendingUp, CheckCircle2, Clock, FolderOpen, ImageIcon } from "lucide-react";
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
  { key: "in-progress", label: "🟢 In Progress" },
  { key: "completed", label: "✅ Completed" },
];

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const db = getDb();
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const firebaseProjects = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            status: d.status || "completed",
            progress: typeof d.progress === "number" ? d.progress : 100,
          };
        }) as Project[];
        setProjects(firebaseProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setProjects([]);
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  const filtered = projects.filter((p) => {
    const matchCategory = activeCategory === "all" || p.category === activeCategory;
    const matchStatus = activeStatus === "all" || (p.status || "completed") === activeStatus;
    return matchCategory && matchStatus;
  });

  const getImageUrl = (project: Project): string =>
    project.imageUrl || project.image || images.fallback.project || "";

  return (
    <>
      <PageHero title="Our Projects Portfolio" breadcrumb="Home" image={images.hero.projects} />

      <section className="py-6 bg-white sticky top-16 lg:top-20 z-30 shadow-sm border-b border-slate-100">
        <div className="section-container space-y-4">
          <div className="flex flex-wrap gap-2 justify-center border-b border-slate-100 pb-3">
            {statusFilters.map((st) => (
              <button
                key={st.key}
                onClick={() => setActiveStatus(st.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${activeStatus === st.key ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {st.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${activeCategory === cat.key ? "bg-accent text-primary-dark shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 min-h-[50vh]">
        <div className="section-container">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" size={40} /></div>
          ) : projects.length === 0 ? (
            <AnimateOnScroll>
              <div className="max-w-md mx-auto text-center py-16">
                <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FolderOpen size={40} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">No Projects Yet</h3>
                <p className="text-slate-500 leading-relaxed">Our project portfolio is being updated. Please check back soon.</p>
              </div>
            </AnimateOnScroll>
          ) : filtered.length === 0 ? (
            <AnimateOnScroll>
              <div className="max-w-md mx-auto text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">No Matching Projects</h3>
                <p className="text-slate-500 leading-relaxed mb-4">No projects match your current filters.</p>
                <button onClick={() => { setActiveCategory("all"); setActiveStatus("all"); }} className="text-accent font-semibold text-sm hover:underline">
                  Clear all filters
                </button>
              </div>
            </AnimateOnScroll>
          ) : (
            <>
              <div className="text-center mb-10">
                <p className="text-slate-400 text-sm">Showing {filtered.length} project{filtered.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project, i) => {
                  const imgUrl = getImageUrl(project);
                  const showImg = hasImage(imgUrl);
                  const isCompleted = project.status === "completed";
                  const isInProgress = project.status === "in-progress";
                  const progressPct = project.progress ?? (isCompleted ? 100 : 50);
                  return (
                    <AnimateOnScroll key={project.id} delay={i * 80}>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 group cursor-pointer border border-slate-100 flex flex-col h-full"
                      >
                        <div className="relative h-56 overflow-hidden w-full">
                          {showImg ? (
                            <Image src={imgUrl} alt={project.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized loading="lazy" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                              <ImageIcon size={48} className="text-slate-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white text-sm flex items-center gap-1 font-semibold">
                              <Search size={14} /> View Details
                            </span>
                          </div>
                          <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md ${isCompleted ? "bg-emerald-500 text-white" : isInProgress ? "bg-amber-500 text-white animate-pulse" : "bg-slate-700 text-white"}`}>
                            {isCompleted ? <CheckCircle2 size={12} /> : isInProgress ? <TrendingUp size={12} /> : <Clock size={12} />}
                            {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Planning"}
                          </span>
                          <span className="absolute top-4 right-4 glass-elevated text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase">{project.category}</span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-primary text-lg mb-2 line-clamp-2 group-hover:text-accent transition-colors">{project.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                              <User size={13} className="text-accent" />
                              <span className="truncate">{project.client}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                              <MapPin size={13} className="text-accent" />
                              <span className="truncate">{project.location}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-100">
                            <div className="flex justify-between items-center text-xs font-semibold mb-1">
                              <span className="text-slate-500">Progress</span>
                              <span className={isCompleted ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{progressPct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-accent"}`} style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>
                        </div>
                      </button>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <Modal open={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.name}>
        {selectedProject && (
          <div>
            <div className="relative h-64 sm:h-72">
              {hasImage(getImageUrl(selectedProject)) ? (
                <Image src={getImageUrl(selectedProject)} alt={selectedProject.name} fill className="object-cover rounded-t-3xl" unoptimized />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center rounded-t-3xl">
                  <ImageIcon size={60} className="text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent rounded-t-3xl" />
              <span className="absolute bottom-4 left-6 glass-elevated text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{selectedProject.category}</span>
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">{selectedProject.name}</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    {selectedProject.status === "completed" ? <CheckCircle2 size={16} className="text-emerald-500" /> : selectedProject.status === "in-progress" ? <TrendingUp size={16} className="text-amber-500" /> : <Clock size={16} className="text-slate-500" />}
                    Status: <strong className="capitalize">{selectedProject.status === "in-progress" ? "In Progress" : selectedProject.status === "planning" ? "Planning" : "Completed"}</strong>
                  </span>
                  <span className="text-accent font-bold">{selectedProject.progress ?? 100}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-accent h-full transition-all duration-500" style={{ width: `${selectedProject.progress ?? 100}%` }} />
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <User size={16} className="text-accent shrink-0" />
                  <div><span className="text-slate-400">Client:</span> <span className="text-slate-700 font-medium">{selectedProject.client}</span></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-accent shrink-0" />
                  <div><span className="text-slate-400">Location:</span> <span className="text-slate-700 font-medium">{selectedProject.location}</span></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Project Scope</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedProject.scope}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}