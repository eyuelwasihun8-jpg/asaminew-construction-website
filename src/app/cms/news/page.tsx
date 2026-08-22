"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import {
  Plus, Trash2, Loader2, Upload, Newspaper, Edit, X,
} from "lucide-react";
import { getDb, getCached, setCached, invalidateCache } from "@/lib/firebase";
import {
  collection, getDocs, addDoc, deleteDoc, updateDoc, doc,
  serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  imageUrl: string;
  date: string;
}

export default function CMSNewsPage() {
  const cachedNews = typeof window !== "undefined" ? getCached<NewsItem[]>("news") : null;
  const [news, setNews] = useState<NewsItem[]>(cachedNews || []);
  const [loading, setLoading] = useState(!cachedNews);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  async function fetchNews() {
    try {
      const db = getDb();
      const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as NewsItem[];
      setNews(data);
      setCached("news", data);
    } catch (err) {
      console.error("Fetch news error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNews();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setUploadPct(0);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      let imageUrl = editingNews?.imageUrl || "";

      // Upload image with progress
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile, "auto", {
          onProgress: (pct) => setUploadPct(pct),
        });
      }

      const newsData = {
        title: fd.get("title") as string,
        excerpt: fd.get("excerpt") as string,
        content: fd.get("content") as string,
        author: (fd.get("author") as string) || "Admin",
        category: fd.get("category") as string,
        imageUrl,
        date: editingNews?.date || new Date().toISOString().split("T")[0],
      };

      const db = getDb();

      if (editingNews) {
        // Optimistic update
        setNews((prev) =>
          prev.map((n) => (n.id === editingNews.id ? { ...n, ...newsData } : n))
        );
        await updateDoc(doc(db, "news", editingNews.id), {
          ...newsData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Optimistic add
        const tempId = `temp_${Date.now()}`;
        const tempItem: NewsItem = { id: tempId, ...newsData };
        setNews((prev) => [tempItem, ...prev]);

        const docRef = await addDoc(collection(db, "news"), {
          ...newsData,
          createdAt: serverTimestamp(),
        });
        // Replace temp id with real id
        setNews((prev) =>
          prev.map((n) => (n.id === tempId ? { ...n, id: docRef.id } : n))
        );
      }

      invalidateCache("news");
      invalidateCache("dashboard");

      form.reset();
      setImageFile(null);
      setShowForm(false);
      setEditingNews(null);
      setUploadPct(0);
    } catch (err) {
      console.error(err);
      alert("Error saving news post");
      // On error, refetch to restore correct state
      fetchNews();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    // Optimistic remove
    const backup = news;
    setNews((prev) => prev.filter((n) => n.id !== id));
    try {
      const db = getDb();
      await deleteDoc(doc(db, "news", id));
      invalidateCache("news");
      invalidateCache("dashboard");
    } catch (err) {
      console.error("Delete error:", err);
      setNews(backup); // rollback
      alert("Failed to delete. Please try again.");
    }
  }

  function handleEdit(item: NewsItem) {
    setEditingNews(item);
    setShowForm(true);
    setImageFile(null);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingNews(null);
    setImageFile(null);
    setUploadPct(0);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-primary">News & Blog</h2>
          <p className="text-slate-500 text-sm">Manage news posts</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingNews(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-accent hover:bg-accent-light text-primary-dark font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
          >
            <Plus size={18} />
            Add Post
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-primary">
              {editingNews ? "Edit Post" : "New Post"}
            </h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                name="title" required placeholder="Post Title"
                defaultValue={editingNews?.title || ""}
                className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
              />
              <select
                name="category" required
                defaultValue={editingNews?.category || ""}
                className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
              >
                <option value="">Select Category</option>
                <option value="Company News">Company News</option>
                <option value="Projects">Projects</option>
                <option value="Press">Press</option>
                <option value="Services">Services</option>
                <option value="Announcement">Announcement</option>
              </select>
            </div>
            <input
              name="author" placeholder="Author (default: Admin)"
              defaultValue={editingNews?.author || ""}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm"
            />
            <textarea
              name="excerpt" required placeholder="Short excerpt / summary"
              defaultValue={editingNews?.excerpt || ""}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm resize-none"
            />
            <textarea
              name="content" required placeholder="Full content"
              defaultValue={editingNews?.content || ""}
              rows={6}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent text-sm resize-none"
            />
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center gap-3 border border-slate-200 border-dashed rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload size={18} className="text-accent" />
                <span className="text-slate-500 text-sm">
                  {imageFile ? imageFile.name : "Upload Cover Image"}
                </span>
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
              {editingNews?.imageUrl && !imageFile && (
                <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                  <Image src={editingNews.imageUrl} alt="Current" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Upload progress bar */}
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

            <div className="flex gap-3">
              <button
                type="submit" disabled={submitting}
                className="bg-accent hover:bg-accent-light text-primary-dark font-bold px-6 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {editingNews ? "Update Post" : "Publish Post"}
              </button>
              <button
                type="button" onClick={handleCancel}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && news.length === 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
              <div className="h-40 bg-slate-100" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-20 bg-slate-100 rounded-full" />
                <div className="h-5 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-2/3 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Newspaper size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No news posts yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {news.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all">
              {post.imageUrl && (
                <div className="relative h-40">
                  <Image src={post.imageUrl} alt={post.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="text-xs bg-accent/10 text-accent font-medium px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                    <h3 className="font-bold text-primary mt-2 line-clamp-2">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="text-xs text-slate-400">
                  {post.author} · {post.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}