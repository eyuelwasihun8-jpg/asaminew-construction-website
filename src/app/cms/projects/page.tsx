"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Loader2,
  Upload,
  Image as ImageIcon,
  Edit,
  X,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getDb, getCached, setCached, invalidateCache } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  scope: string;
  category: string;
  status: "in-progress" | "completed" | "planning";
  progress: number;
  imageUrl: string;
}

export default function CMSProjectsPage() {
  const cachedProjects = typeof window !== "undefined" ? getCached<Project[]>("projects") : null;
  const [projects, setProjects] = useState<Project[]>(cachedProjects || []);
  const [loading, setLoading] = useState(!cachedProjects);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [statusVal, setStatusVal] = useState<string>("completed");
  const [progressVal, setProgressVal] = useState<number>(100);

  async function fetchProjects() {
    try {
      const db = getDb();
      let snap;
      try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        snap = await getDocs(q);
      } catch {
        snap = await getDocs(collection(db, "projects"));
      }
      const data = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          status: raw.status || "completed",
          progress: typeof raw.progress === "number" ? raw.progress : (raw.status === "in-progress" ? 50 : 100),
        };
      }) as Project[];
      setProjects(data);
      setCached("projects", data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function handleEdit(project: Project) {
    setEditingProject(project);
    setStatusVal(project.status || "completed");
    setProgressVal(typeof project.progress === "number" ? project.progress : 100);
    setShowForm(true);
    setImageFile(null);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingProject(null);
    setImageFile(null);
    setStatusVal("completed");
    setProgressVal(100);
    setUploadPct(0);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setUploadPct(0);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      let imageUrl = editingProject?.imageUrl || "";

      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile, "auto", {
          onProgress: (pct) => setUploadPct(pct),
        });
      }

      const status = (fd.get("status") as "in-progress" | "completed" | "planning") || "completed";
      const progress = Number(fd.get("progress")) || (status === "completed" ? 100 : 0);

      const projectData = {
        name: fd.get("name") as string,
        client: fd.get("client") as string,
        location: fd.get("location") as string,
        scope: fd.get("scope") as string,
        category: fd.get("category") as string,
        status,
        progress: Math.min(100, Math.max(0, progress)),
        imageUrl,
      };

      const db = getDb();

      if (editingProject) {
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? { ...p, ...projectData } : p))
        );
        await updateDoc(doc(db, "projects", editingProject.id), {
          ...projectData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const tempId = `temp_${Date.now()}`;
        const tempItem = { id: tempId, ...projectData } as Project;
        setProjects((prev) => [tempItem, ...prev]);

        const docRef = await addDoc(collection(db, "projects"), {
          ...projectData,
          createdAt: serverTimestamp(),
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: docRef.id } : p))
        );
      }

      invalidateCache("projects");
      invalidateCache("dashboard");

      handleCancel();
    } catch (err) {
      console.error("Save project error:", err);
      alert("Error saving project. Check console for details.");
      fetchProjects(); // rollback via refetch
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

    // Optimistic remove
    const backup = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));

    try {
      const db = getDb();
      await deleteDoc(doc(db, "projects", id));
      invalidateCache("projects");
      invalidateCache("dashboard");
      console.log("✅ Project deleted:", id);
    } catch (err) {
      console.error("❌ Delete project error:", err);
      setProjects(backup); // rollback
      alert("Failed to delete project. Check console for details.");
    }
  }

  async function handleQuickProgressUpdate(project: Project, newProgress: number) {
    const updatedStatus = newProgress >= 100 ? "completed" : newProgress > 0 ? "in-progress" : "planning";
    // Optimistic
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, progress: newProgress, status: updatedStatus } : p))
    );
    try {
      const db = getDb();
      await updateDoc(doc(db, "projects", project.id), {
        progress: newProgress,
        status: updatedStatus,
        updatedAt: serverTimestamp(),
      });
      invalidateCache("projects");
    } catch (err) {
      console.error("Error updating progress:", err);
      alert("Failed to update progress.");
      fetchProjects();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-primary">Projects Portfolio</h2>
          <p className="text-slate-500 text-sm">Manage projects, status, and progress percentage</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingProject(null);
              setStatusVal("completed");
              setProgressVal(100);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-accent hover:bg-accent-light text-primary-dark font-bold px-4 py-2.5 rounded-xl transition-all text-sm shadow-md"
          >
            <Plus size={18} />
            Add Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-lg text-primary">
              {editingProject ? "Edit Project Details" : "New Project Details"}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Project Name *</label>
                <input
                  name="name" required
                  placeholder="e.g., Fitch Hospital Construction"
                  defaultValue={editingProject?.name || ""}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name *</label>
                <input
                  name="client" required
                  placeholder="e.g., Oromia Health Bureau"
                  defaultValue={editingProject?.client || ""}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Location *</label>
                <input
                  name="location" required
                  placeholder="e.g., Fitche, Oromia"
                  defaultValue={editingProject?.location || ""}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
                <select
                  name="category" required
                  defaultValue={editingProject?.category || ""}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
                >
                  <option value="">Select Category</option>
                  <option value="building">Building</option>
                  <option value="health">Health Center</option>
                  <option value="bridge">Bridge</option>
                  <option value="road">Road</option>
                  <option value="water">Water & Dam</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Status *</label>
                <select
                  name="status" required
                  value={statusVal}
                  onChange={(e) => {
                    const st = e.target.value;
                    setStatusVal(st);
                    if (st === "completed") setProgressVal(100);
                    if (st === "planning") setProgressVal(0);
                    if (st === "in-progress" && progressVal === 100) setProgressVal(50);
                  }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm bg-white"
                >
                  <option value="in-progress">🟢 In Progress</option>
                  <option value="completed">✅ Completed</option>
                  <option value="planning">📋 Planning Phase</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Completion Progress (%)</label>
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                    {progressVal}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="100" step="5"
                    name="progress"
                    value={progressVal}
                    onChange={(e) => setProgressVal(Number(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                  <input
                    type="number" min="0" max="100"
                    value={progressVal}
                    onChange={(e) => setProgressVal(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Project Scope / Summary *</label>
              <textarea
                name="scope" required
                placeholder="Describe scope of work..."
                defaultValue={editingProject?.scope || ""}
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center gap-3 border border-slate-200 border-dashed rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload size={18} className="text-accent" />
                <span className="text-slate-500 text-sm">
                  {imageFile ? imageFile.name : "Upload Project Cover Photo"}
                </span>
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
              {editingProject?.imageUrl && !imageFile && (
                <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 border">
                  <Image src={editingProject.imageUrl} alt="Current" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>

            {submitting && imageFile && uploadPct > 0 && uploadPct < 100 && (
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Uploading image…</span>
                  <span>{uploadPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-200" style={{ width: `${uploadPct}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={submitting}
                className="bg-accent hover:bg-accent-light text-primary-dark font-bold px-6 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {editingProject ? "Update Project" : "Save Project"}
              </button>
              <button
                type="button" onClick={handleCancel}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <ImageIcon size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No projects added yet. Click &quot;Add Project&quot; to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">Project</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">Client</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">Status & Progress</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600 hidden sm:table-cell">Category</th>
                  <th className="text-right px-6 py-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map((p) => {
                  const isCompleted = p.status === "completed";
                  const isInProgress = p.status === "in-progress";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border">
                              <Image src={p.imageUrl} alt="" fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                              <ImageIcon size={16} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-primary block line-clamp-1">{p.name}</span>
                            <span className="text-xs text-slate-400">{p.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{p.client}</td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 max-w-[160px]">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : isInProgress
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={11} />
                              ) : isInProgress ? (
                                <TrendingUp size={11} />
                              ) : (
                                <Clock size={11} />
                              )}
                              {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Planning"}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-600">{p.progress}%</span>
                          </div>

                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isCompleted ? "bg-emerald-500" : isInProgress ? "bg-amber-500" : "bg-slate-300"
                              }`}
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>

                          <div className="flex gap-1 pt-0.5">
                            {[25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                onClick={() => handleQuickProgressUpdate(p, pct)}
                                title={`Set progress to ${pct}%`}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                                  p.progress === pct
                                    ? "bg-slate-800 text-white font-bold"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(p)}
                            title="Edit full project"
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="Delete project"
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}