"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  MapPin,
  Loader2,
  FolderOpen,
  TrendingUp,
  CheckCircle2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import { images, hasImage } from "@/lib/images";
import { getDb } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  scope: string;
  category: string;
  status?: "in-progress" | "completed" | "planning";
  progress?: number;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  images?: string[];
  image?: string;
}

function getProjectImages(p: Project): string[] {
  if (p.images && p.images.length > 0) {
    return p.images.filter((u) => hasImage(u));
  }
  return [p.imageUrl || p.image, p.imageUrl2, p.imageUrl3].filter(
    (u): u is string => hasImage(u)
  );
}

/** Mini carousel for home project cards */
function CardCarousel({
  urls,
  alt,
}: {
  urls: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const total = urls.length;

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIndex((i) => (i - 1 + total) % total);
    },
    [total]
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIndex((i) => (i + 1) % total);
    },
    [total]
  );

  if (total === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
        <ImageIcon size={40} className="text-slate-400" />
      </div>
    );
  }

  return (
    <>
      {urls.map((url, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === index ? "opacity-100 z-[1]" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={url}
            alt={`${alt} — ${i + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            unoptimized
            loading={i === 0 ? "lazy" : "lazy"}
          />
        </div>
      ))}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-[3] w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-[3] w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-1">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "bg-white w-3.5" : "bg-white/50 w-1.5"
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>

          <span className="absolute bottom-3 right-3 z-[3] bg-black/45 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {index + 1}/{total}
          </span>
        </>
      )}
    </>
  );
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const db = getDb();
        if (!db) {
          console.warn("Firestore not initialized");
          setProjects([]);
          setLoading(false);
          return;
        }

        let snap;
        try {
          const q = query(
            collection(db, "projects"),
            orderBy("createdAt", "desc"),
            limit(6)
          );
          snap = await getDocs(q);
        } catch {
          const q = query(collection(db, "projects"), limit(6));
          snap = await getDocs(q);
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
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-white overflow-x-hidden">
      <div className="section-container">
        <AnimateOnScroll>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 sm:mb-12">
            <SectionHeading
              tag="Featured Portfolio"
              title="Recent Projects"
              align="left"
            />
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
            >
              View all projects <ArrowUpRight size={14} />
            </Link>
          </div>
        </AnimateOnScroll>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : projects.length === 0 ? (
          <AnimateOnScroll>
            <div className="max-w-md mx-auto text-center py-12 px-4">
              <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FolderOpen size={36} className="text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                No Projects Yet
              </h3>
              <p className="text-slate-500 text-sm">
                Our project portfolio is being updated. Please check back soon.
              </p>
            </div>
          </AnimateOnScroll>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {projects.map((project, i) => {
              const imgs = getProjectImages(project);
              const displayImgs =
                imgs.length > 0
                  ? imgs
                  : hasImage(images.fallback.project)
                  ? [images.fallback.project]
                  : [];

              const isCompleted = project.status === "completed";
              const isInProgress = project.status === "in-progress";
              const progressPct =
                project.progress ?? (isCompleted ? 100 : 50);

              return (
                <AnimateOnScroll key={project.id} delay={i * 80}>
                  <Link
                    href="/projects"
                    className="block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-1.5 border border-slate-100 group h-full flex flex-col min-w-0"
                  >
                    <div className="relative h-48 sm:h-52 overflow-hidden">
                      <CardCarousel urls={displayImgs} alt={project.name} />

                      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/20 to-transparent z-[2] pointer-events-none" />

                      <span className="absolute top-3 left-3 z-[3] glass-elevated text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {project.category}
                      </span>

                      <span
                        className={`absolute top-3 right-3 z-[3] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1 ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isInProgress
                            ? "bg-amber-500 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={10} />
                        ) : isInProgress ? (
                          <TrendingUp size={10} />
                        ) : null}
                        {isCompleted
                          ? "Done"
                          : isInProgress
                          ? "Active"
                          : "Planning"}
                      </span>

                      <div className="absolute bottom-3 right-3 z-[3] w-9 h-9 glass-elevated rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 mb-1.5 break-words leading-snug group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-slate-500 text-sm truncate">
                          {project.client}
                        </p>
                        <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1 min-w-0">
                          <MapPin size={11} className="shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </p>
                      </div>

                      {isInProgress && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs mb-1 gap-2">
                            <span className="text-slate-500 font-semibold">
                              Progress
                            </span>
                            <span className="text-amber-600 font-bold shrink-0">
                              {progressPct}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-accent transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, progressPct)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </AnimateOnScroll>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}