"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, Loader2, FolderOpen, TrendingUp, CheckCircle2, ImageIcon } from "lucide-react";
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

        // Try with orderBy first, fall back to simple fetch if createdAt missing
        let snap;
        try {
          const q = query(
            collection(db, "projects"),
            orderBy("createdAt", "desc"),
            limit(6)
          );
          snap = await getDocs(q);
        } catch {
          // Fallback: fetch without ordering (in case createdAt field is missing)
          const q = query(collection(db, "projects"), limit(6));
          snap = await getDocs(q);
        }

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
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const getImageUrl = (project: Project): string =>
    project.imageUrl || images.fallback.project || "";

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <AnimateOnScroll>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <SectionHeading tag="Featured Portfolio" title="Recent Projects" align="left" />
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
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FolderOpen size={36} className="text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">No Projects Yet</h3>
              <p className="text-slate-500 text-sm">
                Our project portfolio is being updated. Please check back soon.
              </p>
            </div>
          </AnimateOnScroll>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, i) => {
              const imgUrl = getImageUrl(project);
              const showImg = hasImage(imgUrl);
              const isCompleted = project.status === "completed";
              const isInProgress = project.status === "in-progress";
              const progressPct = project.progress ?? (isCompleted ? 100 : 50);

              return (
                <AnimateOnScroll key={project.id} delay={i * 80}>
                  <Link
                    href="/projects"
                    className="block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-1.5 border border-slate-100 group h-full flex flex-col"
                  >
                    <div className="relative h-52 overflow-hidden">
                      {showImg ? (
                        <Image
                          src={imgUrl}
                          alt={project.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          unoptimized
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <ImageIcon size={40} className="text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/20 to-transparent" />
                      <span className="absolute top-3 left-3 glass-elevated text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {project.category}
                      </span>
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1 ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isInProgress
                            ? "bg-amber-500 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={10} /> : isInProgress ? <TrendingUp size={10} /> : null}
                        {isCompleted ? "Done" : isInProgress ? "Active" : "Planning"}
                      </span>
                      <div className="absolute bottom-3 right-3 w-9 h-9 glass-elevated rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-slate-500 text-sm">{project.client}</p>
                        <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                          <MapPin size={11} />
                          {project.location}
                        </p>
                      </div>
                      {isInProgress && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-slate-500 font-semibold">Progress</span>
                            <span className="text-amber-600 font-bold">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-accent transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
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