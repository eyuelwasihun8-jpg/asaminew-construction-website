"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  MessageSquare,
  FileText,
  X,
  Check,
  Inbox,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { getDb } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

interface Notification {
  id: string;      // UI id: "contact_xxx" / "app_xxx"
  docId: string;   // Firestore document id (read-only here)
  type: "contact" | "application";
  title: string;
  subtitle: string;
  href: string;
  createdAtMs: number;
}

const LAST_SEEN_KEY = "cms_notifications_last_seen";
const DISMISSED_KEY = "cms_notifications_dismissed";

function getLastSeen(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(LAST_SEEN_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

function setLastSeen(ts: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SEEN_KEY, String(ts));
}

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveDismissed(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    // keep the list small
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids.slice(0, 200)));
  } catch {
    // ignore
  }
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationBell() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeenState] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    setLastSeenState(getLastSeen());
    setDismissed(getDismissed());
  }, []);

  useEffect(() => {
    const db = getDb();

    const contactsQuery = query(
      collection(db, "contacts"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const applicationsQuery = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    let contactsData: Notification[] = [];
    let applicationsData: Notification[] = [];

    const merge = () => {
      const merged = [...contactsData, ...applicationsData]
        .sort((a, b) => b.createdAtMs - a.createdAtMs)
        .slice(0, 30);
      setAllNotifications(merged);

      if (
        !initialLoadRef.current &&
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        const newest = merged[0];
        if (newest && newest.createdAtMs > getLastSeen()) {
          if (Notification.permission === "granted") {
            try {
              new Notification(
                newest.type === "contact"
                  ? "New message received"
                  : "New application received",
                { body: newest.title, icon: "/favicon.ico" }
              );
            } catch {
              // ignore
            }
          }
        }
      }
      initialLoadRef.current = false;
    };

    const unsubContacts = onSnapshot(
      contactsQuery,
      (snap) => {
        contactsData = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.seconds
            ? data.createdAt.seconds * 1000
            : Date.now();
          return {
            id: `contact_${d.id}`,
            docId: d.id,
            type: "contact" as const,
            title: data.name || "Unknown",
            subtitle: data.subject || "New message",
            href: "/cms/contacts",
            createdAtMs: ts,
          };
        });
        merge();
      },
      (error) => console.error("Notifications contacts error:", error)
    );

    const unsubApps = onSnapshot(
      applicationsQuery,
      (snap) => {
        applicationsData = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.seconds
            ? data.createdAt.seconds * 1000
            : Date.now();
          return {
            id: `app_${d.id}`,
            docId: d.id,
            type: "application" as const,
            title: data.fullName || "Unknown",
            subtitle: data.position || "New application",
            href: "/cms/applications",
            createdAtMs: ts,
          };
        });
        merge();
      },
      (error) => console.error("Notifications applications error:", error)
    );

    return () => {
      unsubContacts();
      unsubApps();
    };
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      const askOnce = () => {
        try {
          Notification.requestPermission();
        } catch {
          // ignore
        }
        document.removeEventListener("click", askOnce);
      };
      document.addEventListener("click", askOnce, { once: true });
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open]);

  // Visible = all notifications minus dismissed ones
  const notifications = useMemo(
    () => allNotifications.filter((n) => !dismissed.includes(n.id)),
    [allNotifications, dismissed]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.createdAtMs > lastSeen).length,
    [notifications, lastSeen]
  );

  const dismissedCount = useMemo(
    () => allNotifications.filter((n) => dismissed.includes(n.id)).length,
    [allNotifications, dismissed]
  );

  function markAllRead() {
    const newTs = Date.now();
    setLastSeen(newTs);
    setLastSeenState(newTs);
  }

  function handleItemClick() {
    markAllRead();
    setOpen(false);
  }

  // ✅ Only hides the notification. Does NOT delete anything from Firestore.
  function dismissNotification(e: React.MouseEvent, notificationId: string) {
    e.preventDefault();
    e.stopPropagation();
    const next = [notificationId, ...dismissed];
    setDismissed(next);
    saveDismissed(next);
  }

  function dismissAll(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = [...allNotifications.map((n) => n.id), ...dismissed];
    setDismissed(next);
    saveDismissed(next);
    markAllRead();
  }

  function restoreDismissed(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDismissed([]);
    saveDismissed([]);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 inline-flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-accent text-primary-dark text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-accent" />
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-accent text-primary-dark text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-primary hover:text-primary-light inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white transition-colors"
                >
                  <Check size={11} />
                  Mark read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-white transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Info line */}
          <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100">
            <p className="text-[11px] text-slate-600">
              Clearing a notification only hides it here. Your messages and
              applications stay safe.
            </p>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Inbox size={20} className="text-slate-400" />
              </div>
              <p className="text-slate-700 text-sm font-medium">
                {dismissedCount > 0 ? "All caught up" : "No notifications yet"}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {dismissedCount > 0
                  ? "You cleared your recent notifications."
                  : "New messages and applications will appear here."}
              </p>
              {dismissedCount > 0 && (
                <button
                  onClick={restoreDismissed}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw size={12} />
                  Restore cleared notifications
                </button>
              )}
            </div>
          ) : (
            <ul className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
              {notifications.map((n) => {
                const isUnread = n.createdAtMs > lastSeen;
                const Icon = n.type === "contact" ? MessageSquare : FileText;

                return (
                  <li key={n.id} className="group relative">
                    <div
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                        isUnread ? "bg-accent/[0.03]" : ""
                      }`}
                    >
                      <Link
                        href={n.href}
                        onClick={handleItemClick}
                        className="flex items-start gap-3 min-w-0 flex-1"
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            n.type === "contact"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-violet-50 text-violet-600"
                          }`}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {n.title}
                            </div>
                            {isUnread && (
                              <span className="w-2 h-2 bg-accent rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {n.type === "contact"
                              ? "Message: "
                              : "Applied for: "}
                            {n.subtitle}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {timeAgo(n.createdAtMs)}
                          </div>
                        </div>
                      </Link>

                      {/* Clear (hide only) */}
                      <button
                        onClick={(e) => dismissNotification(e, n.id)}
                        title="Clear this notification (does not delete data)"
                        className="shrink-0 w-8 h-8 inline-flex items-center justify-center text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <button
                  onClick={dismissAll}
                  className="inline-flex items-center gap-1 hover:text-slate-800 font-medium"
                >
                  <Trash2 size={11} />
                  Clear all
                </button>
              )}
              {dismissedCount > 0 && (
                <button
                  onClick={restoreDismissed}
                  className="inline-flex items-center gap-1 hover:text-slate-800 font-medium"
                >
                  <RotateCcw size={11} />
                  Restore
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/cms/contacts"
                onClick={handleItemClick}
                className="hover:text-primary font-medium"
              >
                Messages
              </Link>
              <Link
                href="/cms/applications"
                onClick={handleItemClick}
                className="hover:text-primary font-medium"
              >
                Applications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}