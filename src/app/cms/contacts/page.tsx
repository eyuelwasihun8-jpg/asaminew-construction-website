"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Loader2,
  MessageSquare,
  Mail,
  Phone,
  Search,
  Calendar,
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

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: { seconds: number } | null;
}

export default function CMSContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  useEffect(() => {
    const db = getDb();
    const q = query(
      collection(db, "contacts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        console.log("📬 Contacts updated. Count:", snap.docs.length);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Contact[];
        setContacts(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Contacts fetch error:", error);
        setContacts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    try {
      const db = getDb();
      await deleteDoc(doc(db, "contacts", id));
      if (activeContact?.id === id) setActiveContact(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete. Please try again.");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.message?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Messages</h2>
          <p className="text-slate-500 text-sm mt-1">
            Contact form submissions from visitors.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <MessageSquare size={16} className="text-accent" />
          <span className="font-medium">{contacts.length}</span>
          <span className="text-slate-400">total</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages by name, email, or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">
                {contacts.length === 0 ? "No messages yet" : "No matches"}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {contacts.length === 0
                  ? "Visitor inquiries will show up here."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {filtered.map((c) => {
                const active = activeContact?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveContact(c)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors ${
                        active ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <span className="font-semibold text-slate-900 truncate text-sm">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {c.createdAt
                            ? new Date(c.createdAt.seconds * 1000).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" }
                              )
                            : ""}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-primary truncate mb-0.5">
                        {c.subject}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-2">
                        {c.message}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl min-h-[400px]">
          {activeContact ? (
            <div className="flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-lg truncate">
                    {activeContact.subject || "(No subject)"}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {activeContact.createdAt
                        ? new Date(
                            activeContact.createdAt.seconds * 1000
                          ).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Unknown date"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(activeContact.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {activeContact.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">
                      {activeContact.name}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <Mail size={11} />
                        {activeContact.email}
                      </span>
                      {activeContact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          {activeContact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 flex-1">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Message
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {activeContact.message}
                </p>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                <a
                  href={`mailto:${activeContact.email}`}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Mail size={13} />
                  Reply via email
                </a>
                {activeContact.phone && (
                  <a
                    href={`tel:${activeContact.phone}`}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    <Phone size={13} />
                    Call
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">Select a message</p>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">
                Choose a conversation from the list to view the full message and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}