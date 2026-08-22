"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Newspaper,
  Briefcase,
  MessageSquare,
  FileText,
  Users,
  ArrowUpRight,
  ArrowRight,
  Activity,
  Eye,
  Globe,
  CalendarDays,
} from "lucide-react";
import { getDb, getCached, setCached } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface VacancyStats {
  title: string;
  applications: number;
}

interface RecentApplication {
  id: string;
  fullName: string;
  position: string;
  createdAt: { seconds: number } | null;
}

interface RecentContact {
  id: string;
  name: string;
  subject: string;
  createdAt: { seconds: number } | null;
}

interface DashboardData {
  stats: {
    projects: number;
    news: number;
    vacancies: number;
    contacts: number;
    applications: number;
  };
  vacancyStats: VacancyStats[];
  recentApps: RecentApplication[];
  recentContacts: RecentContact[];
}

const cardColors = [
  { from: "from-primary", to: "to-primary-light", icon: FolderOpen },
  { from: "from-emerald-500", to: "to-emerald-600", icon: Newspaper },
  { from: "from-violet-500", to: "to-violet-600", icon: Briefcase },
  { from: "from-amber-500", to: "to-amber-600", icon: MessageSquare },
  { from: "from-rose-500", to: "to-rose-600", icon: FileText },
];

const EMPTY_DATA: DashboardData = {
  stats: { projects: 0, news: 0, vacancies: 0, contacts: 0, applications: 0 },
  vacancyStats: [],
  recentApps: [],
  recentContacts: [],
};

export default function CMSDashboard() {
  // Load cached data instantly (no loading state if cache hit)
  const cached = typeof window !== "undefined" ? getCached<DashboardData>("dashboard") : null;
  const [data, setData] = useState<DashboardData>(cached || EMPTY_DATA);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    async function fetchData() {
      try {
        const db = getDb();

        // 🚀 PARALLEL: fire all 7 queries at once instead of sequential
        const [
          projectsSnap,
          newsSnap,
          vacanciesSnap,
          contactsSnap,
          applicationsSnap,
          recentAppsSnap,
          recentContactsSnap,
        ] = await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "news")),
          getDocs(collection(db, "vacancies")),
          getDocs(collection(db, "contacts")),
          getDocs(collection(db, "applications")),
          getDocs(query(collection(db, "applications"), orderBy("createdAt", "desc"), limit(6))),
          getDocs(query(collection(db, "contacts"), orderBy("createdAt", "desc"), limit(6))),
        ]);

        // Build applications-per-vacancy map from applicationsSnap (already fetched)
        const appsByPosition: Record<string, number> = {};
        applicationsSnap.docs.forEach((doc) => {
          const position = doc.data().position as string;
          if (position) appsByPosition[position] = (appsByPosition[position] || 0) + 1;
        });

        const vStats: VacancyStats[] = vacanciesSnap.docs.map((doc) => {
          const title = doc.data().title as string;
          return { title, applications: appsByPosition[title] || 0 };
        });

        const newData: DashboardData = {
          stats: {
            projects: projectsSnap.size,
            news: newsSnap.size,
            vacancies: vacanciesSnap.size,
            contacts: contactsSnap.size,
            applications: applicationsSnap.size,
          },
          vacancyStats: vStats,
          recentApps: recentAppsSnap.docs.map((d) => ({
            id: d.id,
            fullName: d.data().fullName,
            position: d.data().position,
            createdAt: d.data().createdAt || null,
          })),
          recentContacts: recentContactsSnap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
            subject: d.data().subject,
            createdAt: d.data().createdAt || null,
          })),
        };

        setData(newData);
        setCached("dashboard", newData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const cards = [
    { label: "Projects", count: data.stats.projects, href: "/cms/projects", sub: "Portfolio items" },
    { label: "News Posts", count: data.stats.news, href: "/cms/news", sub: "Published articles" },
    { label: "Vacancies", count: data.stats.vacancies, href: "/cms/vacancies", sub: "Open positions" },
    { label: "Messages", count: data.stats.contacts, href: "/cms/contacts", sub: "Inbox inquiries" },
    { label: "Applications", count: data.stats.applications, href: "/cms/applications", sub: "Job candidates" },
  ];

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const maxApplications = useMemo(
    () => Math.max(1, ...data.vacancyStats.map((v) => v.applications)),
    [data.vacancyStats]
  );

  return (
    <div className="space-y-6">
      {/* Welcome bar */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Overview</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Welcome back, Admin</h2>
          <p className="text-slate-500 mt-1 text-sm flex items-center gap-2">
            <CalendarDays size={14} />
            {today}
            {loading && <span className="text-xs text-slate-400">· refreshing…</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            <Globe size={14} />
            View site
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => {
          const Icon = cardColors[i].icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              prefetch
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cardColors[i].from} ${cardColors[i].to} flex items-center justify-center shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-3xl font-bold text-slate-900 leading-none">
                {loading && !cached ? (
                  <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" />
                ) : (
                  card.count.toLocaleString()
                )}
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium text-slate-700">{card.label}</div>
                <div className="text-xs text-slate-400">{card.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two-column main */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applications per vacancy */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity size={16} className="text-accent" />
                Applications per Vacancy
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of candidates across open positions.</p>
            </div>
            <Link href="/cms/vacancies" prefetch className="text-xs font-medium text-primary hover:text-primary-light inline-flex items-center gap-1">
              Manage vacancies
              <ArrowUpRight size={12} />
            </Link>
          </div>

          {data.vacancyStats.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {loading && !cached ? "Loading…" : "No vacancies posted yet."}
            </div>
          ) : (
            <div className="space-y-4">
              {data.vacancyStats.map((v) => {
                const pct = Math.max(8, (v.applications / maxApplications) * 100);
                return (
                  <div key={v.title}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-sm font-medium text-slate-700 truncate pr-3">{v.title}</div>
                      <div className="text-sm font-semibold text-slate-900 tabular-nums">{v.applications}</div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary via-primary-light to-accent rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">Quick guide</span>
          </div>
          <h3 className="text-lg font-bold">Manage your website</h3>
          <p className="text-slate-400 text-sm mt-1 mb-5">Everything you need to keep the corporate site up to date.</p>
          <div className="space-y-3 text-sm">
            <Link href="/cms/projects" prefetch className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <span className="flex items-center gap-2"><FolderOpen size={15} className="text-accent" />Projects</span>
              <ArrowRight size={14} className="text-slate-500" />
            </Link>
            <Link href="/cms/news" prefetch className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <span className="flex items-center gap-2"><Newspaper size={15} className="text-accent" />News & Blog</span>
              <ArrowRight size={14} className="text-slate-500" />
            </Link>
            <Link href="/cms/vacancies" prefetch className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <span className="flex items-center gap-2"><Briefcase size={15} className="text-accent" />Vacancies</span>
              <ArrowRight size={14} className="text-slate-500" />
            </Link>
            <Link href="/cms/applications" prefetch className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <span className="flex items-center gap-2"><FileText size={15} className="text-accent" />Applications</span>
              <ArrowRight size={14} className="text-slate-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-accent" />
              Recent Applications
            </h3>
            <Link href="/cms/applications" prefetch className="text-xs font-medium text-primary hover:text-primary-light inline-flex items-center gap-1">
              View all
              <ArrowUpRight size={12} />
            </Link>
          </div>
          {data.recentApps.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-sm">
              {loading && !cached ? "Loading…" : "No applications yet."}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentApps.map((app) => (
                <li key={app.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {app.fullName?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{app.fullName}</div>
                      <div className="text-xs text-slate-500 truncate">{app.position}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0 ml-3">
                    {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={16} className="text-accent" />
              Recent Messages
            </h3>
            <Link href="/cms/contacts" prefetch className="text-xs font-medium text-primary hover:text-primary-light inline-flex items-center gap-1">
              View all
              <ArrowUpRight size={12} />
            </Link>
          </div>
          {data.recentContacts.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-sm">
              {loading && !cached ? "Loading…" : "No messages yet."}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentContacts.map((c) => (
                <li key={c.id} className="px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-slate-900 truncate">{c.name}</div>
                    <div className="text-xs text-slate-400 shrink-0 ml-3">
                      {c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{c.subject}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}