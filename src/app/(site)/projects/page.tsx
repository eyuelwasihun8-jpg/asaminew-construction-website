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
  if (p.images && p.images.length > 0) {
    return p.images.filter((u) => hasImage(u));
  }
  return [p.imageUrl || p.image, p.imageUrl2, p.imageUrl3].filter(
    (u): u is string => hasImage(u)
  );
}

/** Simple image carousel */
function ImageCarousel({
  urls,
  alt,
  className = "h-56",
  rounded = "",
}: {
  urls: string[];
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const [index, setIndex] = useState(0);
  const total = urls.length;

  const prev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIndex((i) => (i - 1 + total) % total);
    },
    [total]
  );

  const next = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIndex((i) => (i + 1) % total);
    },
    [total]
  );

  if (total === 0) {
    return (
      <div
        className={`relative w-full ${className} bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center ${rounded}`}
      >
        <ImageIcon size={48} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className} overflow-hidden ${rounded} group/carousel`}>
      {urls.map((url, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === index ? "opacity-100 z-[1]" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={url}
            alt={`${alt} — photo ${i + 1}`}
            fill
            className="object-cover"
            unoptimized
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Arrows — only if more than 1 image */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-[2] w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            aria-label="Previous photo"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-[2] w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            aria-label="Next photo"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[2] flex items-center gap-1.5">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === index
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter badge */}
          <span className="absolute top-3 right-3 z-[2] bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {index + 1}/{total}
          </span>
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
          const q = query(
            collection(db, "projects"),
            orderBy("createdAt", "desc")
          );
          snap = await getDocs(q);
        } catch {
          snap = await getDocs(collection(db, "projects"));
        }
        const firebaseProjects = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
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

  // Reset carousel when opening a different project
  useEffect(() => {
    setModalImgIndex(0);
  }, [selectedProject?.id]);

  const filtered = projects.filter((p) => {
    const matchCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchStatus =
      activeStatus === "all" || (p.status || "completed") === activeStatus;
    return matchCategory && matchStatus;
  });

  return (
    <>
      <PageHero
        title="Our Projects Portfolio"
        breadcrumb="Home"
        image={images.hero.projects}
      />

      <section className="py-4 sm:py-6 bg-white sticky top-[4.5rem] sm:top-20 z-30 shadow-sm border-b border-slate-100">
        <div className="section-container space-y-3 sm:space-y-4">
          <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-2 border-b border-slate-100 scrollbar-hide -mx-1 px-1">
            {statusFilters.map((st) => (
              <button
                key={st.key}
                onClick={() => setActiveStatus(st.key)}
                className={`shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeStatus === st.key
                    ? "bg-primary text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat.key
                    ? "bg-accent text-primary-dark shadow-md"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 bg-slate-50 min-h-[50vh]">
        <div className="section-container">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent" size={40} />
            </div>
          ) : projects.length === 0 ? (
            <AnimateOnScroll>
              <div className="max-w-md mx-auto text-center py-16 px-4">
                <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FolderOpen size={40} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">
                  No Projects Yet
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Our project portfolio is being updated. Please check back soon.
                </p>
              </div>
            </AnimateOnScroll>
          ) : filtered.length === 0 ? (
            <AnimateOnScroll>
              <div className="max-w-md mx-auto text-center py-16 px-4">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  No Matching Projects
                </h3>
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveStatus("all");
                  }}
                  className="text-accent font-semibold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            </AnimateOnScroll>
          ) : (
            <>
              <div className="text-center mb-8 sm:mb-10">
                <p className="text-slate-400 text-sm">
                  Showing {filtered.length} project
                  {filtered.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((project, i) => {
                  const imgs = getProjectImages(project);
                  const isCompleted = project.status === "completed";
                  const isInProgress = project.status === "in-progress";
                  const progressPct =
                    project.progress ?? (isCompleted ? 100 : 50);

                  return (
                    <AnimateOnScroll key={project.id} delay={i * 60}>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="w-full max-w-full text-left bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 sm:hover:-translate-y-2 group cursor-pointer border border-slate-100 flex flex-col h-full"
                      >
                        {/* Carousel on card */}
                        <div className="relative">
                          <ImageCarousel
                            urls={
                              imgs.length
                                ? imgs
                                : hasImage(images.fallback.project)
                                ? [images.fallback.project]
                                : []
                            }
                            alt={project.name}
                            className="h-48 sm:h-56"
                          />
                          <span
                            className={`absolute top-3 left-3 z-[3] text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md ${
                              isCompleted
                                ? "bg-emerald-500 text-white"
                                : isInProgress
                                ? "bg-amber-500 text-white"
                                : "bg-slate-700 text-white"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={12} />
                            ) : isInProgress ? (
                              <TrendingUp size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                            {isCompleted
                              ? "Completed"
                              : isInProgress
                              ? "In Progress"
                              : "Planning"}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
                          <div className="min-w-0">
                            <h3 className="font-bold text-primary text-base sm:text-lg mb-2 break-words leading-snug group-hover:text-accent transition-colors">
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1 min-w-0">
                              <User size={13} className="text-accent shrink-0" />
                              <span className="truncate">{project.client}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 min-w-0">
                              <MapPin
                                size={13}
                                className="text-accent shrink-0"
                              />
                              <span className="truncate">
                                {project.location}
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 w-full min-w-0">
                            <div className="flex justify-between items-center text-xs font-semibold mb-1 gap-2">
                              <span className="text-slate-500">Progress</span>
                              <span
                                className={`shrink-0 ${
                                  isCompleted
                                    ? "text-emerald-600 font-bold"
                                    : "text-amber-600 font-bold"
                                }`}
                              >
                                {progressPct}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isCompleted
                                    ? "bg-emerald-500"
                                    : "bg-gradient-to-r from-amber-500 to-accent"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, progressPct)
                                  )}%`,
                                }}
                              />
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

      {/* Detail Modal with carousel */}
      <Modal
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name}
      >
        {selectedProject && (
          <div className="overflow-x-hidden">
            {(() => {
              const modalImgs = getProjectImages(selectedProject);
              const displayImgs =
                modalImgs.length > 0
                  ? modalImgs
                  : hasImage(images.fallback.project)
                  ? [images.fallback.project]
                  : [];
              const total = displayImgs.length;

              return (
                <div className="relative w-full h-52 sm:h-72 bg-slate-200">
                  {displayImgs.length > 0 ? (
                    displayImgs.map((url, i) => (
                      <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          i === modalImgIndex
                            ? "opacity-100 z-[1]"
                            : "opacity-0 z-0"
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`${selectedProject.name} ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon size={60} className="text-slate-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-transparent to-transparent z-[2] pointer-events-none" />

                  {total > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setModalImgIndex(
                            (i) => (i - 1 + total) % total
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-[3] w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setModalImgIndex((i) => (i + 1) % total)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-[3] w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3] flex gap-1.5">
                        {displayImgs.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setModalImgIndex(i)}
                            className={`h-2 rounded-full transition-all ${
                              i === modalImgIndex
                                ? "bg-white w-5"
                                : "bg-white/50 w-2"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="absolute top-3 right-3 z-[3] bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {modalImgIndex + 1}/{total}
                      </span>
                    </>
                  )}

                  <span className="absolute bottom-4 left-4 sm:left-6 z-[3] glass-elevated text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {selectedProject.category}
                  </span>
                </div>
              );
            })()}

            {/* Thumbnails strip */}
            {getProjectImages(selectedProject).length > 1 && (
              <div className="flex gap-2 px-4 sm:px-6 pt-4 overflow-x-auto">
                {getProjectImages(selectedProject).map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setModalImgIndex(i)}
                    className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      i === modalImgIndex
                        ? "border-accent shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 sm:p-6 md:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4 break-words leading-snug">
                {selectedProject.name}
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm font-semibold">
                  <span className="text-slate-600 flex items-center gap-1.5 min-w-0">
                    {selectedProject.status === "completed" ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 shrink-0"
                      />
                    ) : selectedProject.status === "in-progress" ? (
                      <TrendingUp
                        size={16}
                        className="text-amber-500 shrink-0"
                      />
                    ) : (
                      <Clock size={16} className="text-slate-500 shrink-0" />
                    )}
                    Status:{" "}
                    <strong className="capitalize">
                      {selectedProject.status === "in-progress"
                        ? "In Progress"
                        : selectedProject.status === "planning"
                        ? "Planning"
                        : "Completed"}
                    </strong>
                  </span>
                  <span className="text-accent font-bold shrink-0">
                    {selectedProject.progress ?? 100}% Complete
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, selectedProject.progress ?? 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm min-w-0">
                  <User size={16} className="text-accent shrink-0 mt-0.5" />
                  <div className="min-w-0 break-words">
                    <span className="text-slate-400">Client: </span>
                    <span className="text-slate-700 font-medium">
                      {selectedProject.client}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm min-w-0">
                  <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                  <div className="min-w-0 break-words">
                    <span className="text-slate-400">Location: </span>
                    <span className="text-slate-700 font-medium">
                      {selectedProject.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Project Scope
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {selectedProject.scope}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}