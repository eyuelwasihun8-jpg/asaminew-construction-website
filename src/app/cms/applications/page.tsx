"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Loader2,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Search,
  Eye,
  X,
  Calendar,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { getDb } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { makePdfViewableUrl } from "@/lib/cloudinary";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  coverLetter: string;
  cvUrl: string;
  cvFileName?: string;
  createdAt: { seconds: number } | null;
}

export default function CMSApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const db = getDb();
    const q = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        console.log("📋 Applications updated. Count:", snap.docs.length);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Application[];
        setApps(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Applications fetch error:", error);
        setApps([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    try {
      const db = getDb();
      await deleteDoc(doc(db, "applications", id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete. Please try again.");
    }
  }

  const positions = useMemo(() => {
    const set = new Set<string>();
    apps.forEach((a) => a.position && set.add(a.position));
    return Array.from(set);
  }, [apps]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return apps.filter((a) => {
      const matchesSearch =
        !q ||
        a.fullName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.position?.toLowerCase().includes(q);
      const matchesPosition =
        positionFilter === "all" || a.position === positionFilter;
      return matchesSearch && matchesPosition;
    });
  }, [apps, search, positionFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Applications</h2>
          <p className="text-slate-500 text-sm mt-1">
            Review and manage incoming job applications.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <FileText size={16} className="text-accent" />
          <span className="font-medium">{apps.length}</span>
          <span className="text-slate-400">total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or position…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="relative">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-white"
          >
            <option value="all">All positions</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 bg-white border border-slate-200 rounded-xl">
          <Loader2 className="animate-spin text-accent" size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium">
            {apps.length === 0 ? "No applications yet" : "No matching applications"}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {apps.length === 0
              ? "New applications will appear here as candidates apply."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Candidate</div>
            <div className="col-span-2">Position</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Submitted</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="px-4 sm:px-6 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-3 md:space-y-0">
                  {/* Candidate */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {app.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {app.fullName}
                        </div>
                        {app.experience && (
                          <div className="text-xs text-slate-500 truncate">
                            {app.experience} experience
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="md:col-span-2">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-md">
                      <Briefcase size={12} />
                      {app.position}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="md:col-span-3 text-sm text-slate-600 space-y-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{app.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{app.phone}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2 text-sm text-slate-500">
                    {app.createdAt ? (
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(app.createdAt.seconds * 1000).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex items-center justify-end gap-2">
                    {app.cvUrl ? (
                      <>
                        <button
                          onClick={() =>
                            setPreviewUrl(makePdfViewableUrl(app.cvUrl))
                          }
                          className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-primary-dark text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye size={12} />
                          View CV
                        </button>
                        <a
                          href={makePdfViewableUrl(app.cvUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                          title="Open CV in new tab"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No CV
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete application"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Cover letter */}
                {app.coverLetter && (
                  <div className="md:pl-13 mt-3 md:mt-2">
                    <details className="text-sm">
                      <summary className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer font-medium select-none">
                        Cover letter
                      </summary>
                      <p className="mt-2 text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {app.coverLetter}
                      </p>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <FileText size={18} className="text-accent" />
                CV Preview
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:text-primary-light inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink size={14} />
                  Open in new tab
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="w-9 h-9 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              className="flex-1 w-full bg-slate-100"
              title="CV Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}