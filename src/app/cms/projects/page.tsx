"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
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
  /** Main cover image (required) */
  imageUrl: string;
  /** Second image (required) */
  imageUrl2?: string;
  /** Third image (optional) */
  imageUrl3?: string;
  /** Convenience array of all images */
  images?: string[];
}

function getProjectImages(p: {
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  images?: string[];
  image?: string;
}): string[] {
  if (p.images && p.images.length > 0) {
    return p.images.filter(Boolean);
  }
  return [p.imageUrl || p.image, p.imageUrl2, p.imageUrl3].filter(
    (u): u is string => !!u && u.trim() !== ""
  );
}

export default function CMSProjectsPage() {
  const cachedProjects =
    typeof window !== "undefined" ? getCached<Project[]>("projects") : null;
  const [projects, setProjects] = useState<Project[]>(cachedProjects || []);
  const [loading, setLoading] = useState(!cachedProjects);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");

  // Three image files
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [imageFile3, setImageFile3] = useState<File | null>(null);

  // Preview URLs for newly selected files
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [preview3, setPreview3] = useState<string | null>(null);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusVal, setStatusVal] = useState<string>("completed");
  const [progressVal, setProgressVal] = useState<number>(100);
  const [formError, setFormError] = useState("");

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
        const images = getProjectImages(raw);
        return {
          id: d.id,
          ...raw,
          status: raw.status || "completed",
          progress:
            typeof raw.progress === "number"
              ? raw.progress
              : raw.status === "in-progress"
              ? 50
              : 100,
          imageUrl: images[0] || raw.imageUrl || "",
          imageUrl2: images[1] || raw.imageUrl2 || "",
          imageUrl3: images[2] || raw.imageUrl3 || "",
          images,
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

  function handleFileSelect(
    e: ChangeEvent<HTMLInputElement>,
    slot: 1 | 2 | 3
  ) {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please select an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFormError("Image must be under 8MB.");
      return;
    }
    setFormError("");
    const url = URL.createObjectURL(file);
    if (slot === 1) {
      setImageFile1(file);
      setPreview1(url);
    } else if (slot === 2) {
      setImageFile2(file);
      setPreview2(url);
    } else {
      setImageFile3(file);
      setPreview3(url);
    }
  }

  function clearImage(slot: 1 | 2 | 3) {
    if (slot === 1) {
      setImageFile1(null);
      setPreview1(null);
    } else if (slot === 2) {
      setImageFile2(null);
      setPreview2(null);
    } else {
      setImageFile3(null);
      setPreview3(null);
    }
  }

  function handleEdit(project: Project) {
    setEditingProject(project);
    setStatusVal(project.status || "completed");
    setProgressVal(typeof project.progress === "number" ? project.progress : 100);
    setShowForm(true);
    setImageFile1(null);
    setImageFile2(null);
    setImageFile3(null);
    setPreview1(null);
    setPreview2(null);
    setPreview3(null);
    setFormError("");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingProject(null);
    setImageFile1(null);
    setImageFile2(null);
    setImageFile3(null);
    setPreview1(null);
    setPreview2(null);
    setPreview3(null);
    setStatusVal("completed");
    setProgressVal(100);
    setUploadPct(0);
    setUploadLabel("");
    setFormError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    // Validate: Image 1 & 2 required for NEW projects
    // For EDIT: either existing URL or new file is enough
    const hasImg1 = !!imageFile1 || !!editingProject?.imageUrl;
    const hasImg2 = !!imageFile2 || !!editingProject?.imageUrl2;

    if (!hasImg1 || !hasImg2) {
      setFormError(
        "Images 1 and 2 are required. Please upload at least two project photos."
      );
      return;
    }

    setSubmitting(true);
    setUploadPct(0);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      let imageUrl = editingProject?.imageUrl || "";
      let imageUrl2 = editingProject?.imageUrl2 || "";
      let imageUrl3 = editingProject?.imageUrl3 || "";

      // Upload image 1 if new file selected
      if (imageFile1) {
        setUploadLabel("Uploading image 1 of 3…");
        imageUrl = await uploadToCloudinary(imageFile1, "image", {
          onProgress: (pct) => setUploadPct(Math.round(pct * 0.33)),
        });
      }

      // Upload image 2 if new file selected
      if (imageFile2) {
        setUploadLabel("Uploading image 2 of 3…");
        imageUrl2 = await uploadToCloudinary(imageFile2, "image", {
          onProgress: (pct) => setUploadPct(33 + Math.round(pct * 0.33)),
        });
      }

      // Upload image 3 if new file selected (optional)
      if (imageFile3) {
        setUploadLabel("Uploading image 3 of 3…");
        imageUrl3 = await uploadToCloudinary(imageFile3, "image", {
          onProgress: (pct) => setUploadPct(66 + Math.round(pct * 0.34)),
        });
      }

      // If user cleared optional image 3 on edit with no replacement, keep existing
      // (only clear if they explicitly want — we keep existing if no new file)

      const status =
        (fd.get("status") as "in-progress" | "completed" | "planning") ||
        "completed";
      const progress =
        Number(fd.get("progress")) || (status === "completed" ? 100 : 0);

      const imagesArr = [imageUrl, imageUrl2, imageUrl3].filter(Boolean);

      const projectData = {
        name: fd.get("name") as string,
        client: fd.get("client") as string,
        location: fd.get("location") as string,
        scope: fd.get("scope") as string,
        category: fd.get("category") as string,
        status,
        progress: Math.min(100, Math.max(0, progress)),
        imageUrl,
        imageUrl2,
        imageUrl3: imageUrl3 || "",
        images: imagesArr,
      };

      const db = getDb();
      setUploadLabel("Saving project…");
      setUploadPct(100);

      if (editingProject) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id ? { ...p, ...projectData } : p
          )
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
      setFormError("Error saving project. Please try again.");
      fetchProjects();
    }
    setSubmitting(false);
    setUploadLabel("");
    setUploadPct(0);
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone."
      )
    )
      return;

    const backup = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));

    try {
      const db = getDb();
      await deleteDoc(doc(db, "projects", id));
      invalidateCache("projects");
      invalidateCache("dashboard");
    } catch (err) {
      console.error("Delete project error:", err);
      setProjects(backup);
      alert("Failed to delete project.");
    }
  }

  async function handleQuickProgressUpdate(
    project: Project,
    newProgress: number
  ) {
    const updatedStatus =
      newProgress >= 100
        ? "completed"
        : newProgress > 0
        ? "in-progress"
        : "planning";
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id
          ? { ...p, progress: newProgress, status: updatedStatus }
          : p
      )
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
      fetchProjects();
    }
  }

  /** Image upload slot UI */
  function ImageSlot({
    slot,
    label,
    required,
    file,
    preview,
    existingUrl,
  }: {
    slot: 1 | 2 | 3;
    label: string;
    required: boolean;
    file: File | null;
    preview: string | null;
    existingUrl?: string;
  }) {
    const displayUrl = preview || existingUrl || "";
    const hasImage = !!displayUrl;

    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">
            {label}{" "}
            {required ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-slate-400 font-normal">(optional)</span>
            )}
          </span>
          {hasImage && (
            <button
              type="button"
              onClick={() => clearImage(slot)}
              className="text-[11px] text-red-500 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {hasImage ? (
          <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-200 bg-white">
            <Image
              src={displayUrl}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
            {file && (
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                New file
              </span>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg h-28 cursor-pointer hover:bg-white hover:border-accent/40 transition-colors">
            <Upload size={18} className="text-accent" />
            <span className="text-xs text-slate-500">Click to upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, slot)}
            />
          </label>
        )}

        {/* Replace button when image exists */}
        {hasImage && (
          <label className="mt-2 flex items-center justify-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline">
            <Upload size={12} />
            Replace photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, slot)}
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-primary">Projects Portfolio</h2>
          <p className="text-slate-500 text-sm">
            Manage projects with up to 3 photos (2 required)
          </p>
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
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Project Name *
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g., Fitch Hospital Construction"
                  defaultValue={editingProject?.name || ""}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Client Name *
                </label>
                <input
                  name="client"
                  required
                  placeholder="e.g., Oromia Health Bureau"
                  defaultValue={editingProject?.client || ""}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Location *
                </label>
                <input
                  name="location"
                  required
                  placeholder="e.g., Fitche, Oromia"
                  defaultValue={editingProject?.location || ""}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  required
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

            {/* Status & Progress */}
            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Status *
                </label>
                <select
                  name="status"
                  required
                  value={statusVal}
                  onChange={(e) => {
                    const st = e.target.value;
                    setStatusVal(st);
                    if (st === "completed") setProgressVal(100);
                    if (st === "planning") setProgressVal(0);
                    if (st === "in-progress" && progressVal === 100)
                      setProgressVal(50);
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
                  <label className="text-xs font-semibold text-slate-700">
                    Completion Progress (%)
                  </label>
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                    {progressVal}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    name="progress"
                    value={progressVal}
                    onChange={(e) => setProgressVal(Number(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressVal}
                    onChange={(e) =>
                      setProgressVal(
                        Math.min(100, Math.max(0, Number(e.target.value)))
                      )
                    }
                    className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Project Scope / Summary *
              </label>
              <textarea
                name="scope"
                required
                placeholder="Describe scope of work..."
                defaultValue={editingProject?.scope || ""}
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm resize-none"
              />
            </div>

            {/* ========== 3 IMAGE UPLOADS ========== */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Project Photos{" "}
                <span className="text-slate-400 font-normal">
                  (2 required, 3rd optional)
                </span>
              </label>
              <div className="grid sm:grid-cols-3 gap-3">
                <ImageSlot
                  slot={1}
                  label="Photo 1 — Cover"
                  required
                  file={imageFile1}
                  preview={preview1}
                  existingUrl={
                    !preview1 ? editingProject?.imageUrl : undefined
                  }
                />
                <ImageSlot
                  slot={2}
                  label="Photo 2"
                  required
                  file={imageFile2}
                  preview={preview2}
                  existingUrl={
                    !preview2 ? editingProject?.imageUrl2 : undefined
                  }
                />
                <ImageSlot
                  slot={3}
                  label="Photo 3"
                  required={false}
                  file={imageFile3}
                  preview={preview3}
                  existingUrl={
                    !preview3 ? editingProject?.imageUrl3 : undefined
                  }
                />
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
                {formError}
              </div>
            )}

            {submitting && (
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{uploadLabel || "Saving…"}</span>
                  <span>{uploadPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-200"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-accent hover:bg-accent-light text-primary-dark font-bold px-6 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {editingProject ? "Update Project" : "Save Project"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
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
          <p className="text-slate-500">
            No projects added yet. Click &quot;Add Project&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Project
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Photos
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Client
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Status & Progress
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600 hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map((p) => {
                  const isCompleted = p.status === "completed";
                  const isInProgress = p.status === "in-progress";
                  const imgs = getProjectImages(p);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {imgs[0] ? (
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border">
                              <Image
                                src={imgs[0]}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                              <ImageIcon size={16} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-primary block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {p.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Photo count thumbnails */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {imgs.map((url, i) => (
                            <div
                              key={i}
                              className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200"
                            >
                              <Image
                                src={url}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ))}
                          <span className="text-[10px] text-slate-400 ml-1 font-medium">
                            {imgs.length}/3
                          </span>
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
                              {isCompleted
                                ? "Completed"
                                : isInProgress
                                ? "In Progress"
                                : "Planning"}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-600">
                              {p.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : isInProgress
                                  ? "bg-amber-500"
                                  : "bg-slate-300"
                              }`}
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <div className="flex gap-1 pt-0.5">
                            {[25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() =>
                                  handleQuickProgressUpdate(p, pct)
                                }
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
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
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