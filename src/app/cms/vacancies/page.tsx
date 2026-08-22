"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Briefcase,
  Edit,
  X,
  Users,
  MapPin,
  Calendar,
  Clock,
  Search,
  ChevronDown,
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

interface ApplicationCount {
  [key: string]: number;
}

export default function CMSVacanciesPage() {
  const cachedVacancies = typeof window !== "undefined" ? getCached<Vacancy[]>("vacancies") : null;
  const [vacancies, setVacancies] = useState<Vacancy[]>(cachedVacancies || []);
  const [appCounts, setAppCounts] = useState<ApplicationCount>({});
  const [loading, setLoading] = useState(!cachedVacancies);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  async function fetchData() {
    try {
      const db = getDb();

      let vSnap;
      try {
        const q = query(collection(db, "vacancies"), orderBy("createdAt", "desc"));
        vSnap = await getDocs(q);
      } catch {
        vSnap = await getDocs(collection(db, "vacancies"));
      }
      const vData = vSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Vacancy[];
      setVacancies(vData);
      setCached("vacancies", vData);

      const appsSnap = await getDocs(collection(db, "applications"));
      const counts: ApplicationCount = {};
      appsSnap.docs.forEach((docSnap) => {
        const position = docSnap.data().position as string;
        if (position) {
          counts[position] = (counts[position] || 0) + 1;
        }
      });
      setAppCounts(counts);
    } catch (err) {
      console.error("Fetch vacancies error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      const vacancyData = {
        title: fd.get("title") as string,
        department: fd.get("department") as string,
        location: fd.get("location") as string,
        type: fd.get("type") as string,
        description: fd.get("description") as string,
        requirements: fd.get("requirements") as string,
        deadline: fd.get("deadline") as string,
      };

      const db = getDb();

      if (editingVacancy) {
        setVacancies((prev) =>
          prev.map((v) => (v.id === editingVacancy.id ? { ...v, ...vacancyData } : v))
        );
        await updateDoc(doc(db, "vacancies", editingVacancy.id), {
          ...vacancyData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const tempId = `temp_${Date.now()}`;
        const tempItem = { id: tempId, ...vacancyData } as Vacancy;
        setVacancies((prev) => [tempItem, ...prev]);

        const docRef = await addDoc(collection(db, "vacancies"), {
          ...vacancyData,
          createdAt: serverTimestamp(),
        });
        setVacancies((prev) =>
          prev.map((v) => (v.id === tempId ? { ...v, id: docRef.id } : v))
        );
      }

      invalidateCache("vacancies");
      invalidateCache("dashboard");

      form.reset();
      setShowForm(false);
      setEditingVacancy(null);
    } catch (err) {
      console.error("Save vacancy error:", err);
      alert("Error saving vacancy. Check console for details.");
      fetchData();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this vacancy? Applications will remain but the position will be removed from the public site.")) return;

    const backup = vacancies;
    setVacancies((prev) => prev.filter((v) => v.id !== id));

    try {
      const db = getDb();
      await deleteDoc(doc(db, "vacancies", id));
      invalidateCache("vacancies");
      invalidateCache("dashboard");
      console.log("✅ Vacancy deleted:", id);
    } catch (err) {
      console.error("❌ Delete vacancy error:", err);
      setVacancies(backup);
      alert("Failed to delete vacancy. Check console for details.");
    }
  }

  function handleEdit(vacancy: Vacancy) {
    setEditingVacancy(vacancy);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingVacancy(null);
  }

  const filtered = vacancies.filter((v) => {
    const matchesSearch =
      !search.trim() ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.department.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || v.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalApplicants = Object.values(appCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vacancies</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage open positions and track applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2">
            <Users size={16} className="text-accent" />
            <span className="font-medium">{totalApplicants}</span>
            <span className="text-slate-400">total applicants</span>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setEditingVacancy(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2.5 rounded-lg transition-all text-sm shadow-sm"
            >
              <Plus size={16} />
              New Vacancy
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vacancies by title or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white"
          >
            <option value="all">All types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">
              {editingVacancy ? "Edit Vacancy" : "New Vacancy"}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Job Title *
                </label>
                <input
                  name="title" required
                  placeholder="e.g. Senior Civil Engineer"
                  defaultValue={editingVacancy?.title || ""}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department *
                </label>
                <input
                  name="department" required
                  placeholder="e.g. Engineering"
                  defaultValue={editingVacancy?.department || ""}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Location *
                </label>
                <input
                  name="location" required
                  placeholder="e.g. Addis Ababa"
                  defaultValue={editingVacancy?.location || ""}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Job Type *
                </label>
                <select
                  name="type" required
                  defaultValue={editingVacancy?.type || ""}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white"
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Application Deadline *
                </label>
                <input
                  name="deadline" type="date" required
                  defaultValue={editingVacancy?.deadline || ""}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description *
              </label>
              <textarea
                name="description" required
                placeholder="Describe the role and responsibilities…"
                defaultValue={editingVacancy?.description || ""}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Requirements *
              </label>
              <textarea
                name="requirements" required
                placeholder="List required qualifications, skills, experience…"
                defaultValue={editingVacancy?.requirements || ""}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-lg transition-all text-sm disabled:opacity-50 shadow-sm"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {editingVacancy ? "Update Vacancy" : "Publish Vacancy"}
              </button>
              <button
                type="button" onClick={handleCancel}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-lg transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && vacancies.length === 0 ? (
        <div className="flex justify-center py-16 bg-white border border-slate-200 rounded-xl">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium">
            {vacancies.length === 0 ? "No vacancies posted yet" : "No matching vacancies"}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {vacancies.length === 0
              ? "Click 'New Vacancy' to publish your first opening."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {filtered.map((vacancy) => {
              const count = appCounts[vacancy.title] || 0;
              return (
                <li key={vacancy.id} className="px-4 sm:px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary-light/10 flex items-center justify-center text-primary shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900">{vacancy.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{vacancy.department}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEdit(vacancy)}
                            className="w-8 h-8 inline-flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(vacancy.id)}
                            className="w-8 h-8 inline-flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{vacancy.description}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap text-xs">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                          <Clock size={11} />
                          {vacancy.type}
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <MapPin size={11} />
                          {vacancy.location}
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Calendar size={11} />
                          Closes {vacancy.deadline}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium ${
                            count > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Users size={11} />
                          {count} applicant{count === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}