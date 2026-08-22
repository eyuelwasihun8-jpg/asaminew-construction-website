"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Newspaper,
  Briefcase,
  MessageSquare,
  FileText,
  Menu,
  X,
  LogOut,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  Search,
  ShieldCheck,
} from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import NotificationBell from "./NotificationBell";

const sidebarLinks = [
  { href: "/cms", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cms/projects", label: "Projects", icon: FolderOpen },
  { href: "/cms/news", label: "News & Blog", icon: Newspaper },
  { href: "/cms/vacancies", label: "Vacancies", icon: Briefcase },
  { href: "/cms/contacts", label: "Messages", icon: MessageSquare },
  { href: "/cms/applications", label: "Applications", icon: FileText },
];

const ADMIN_EMAIL = "asaminewteshome2025@gmail.com";
const ADMIN_UID = "8bCc0nCXx6goIGxVObvnExPZ2Li1";

function getPageTitle(pathname: string): string {
  const link = sidebarLinks.find((l) => l.href === pathname);
  return link?.label ?? "Admin Panel";
}

export default function CMSLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser && (currentUser.email === ADMIN_EMAIL || currentUser.uid === ADMIN_UID)) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoginLoading(true);

    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);

      if (result.user.email !== ADMIN_EMAIL && result.user.uid !== ADMIN_UID) {
        await signOut(firebaseAuth);
        setError("Unauthorized access. Only admin can login.");
        setLoginLoading(false);
        return;
      }

      setUser(result.user);
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === "auth/user-not-found") {
        setError("User not found. Please check your email.");
      } else if (errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
        setError("Invalid password. Please try again.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (errorCode === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
    setLoginLoading(false);
  }

  async function handleLogout() {
    try {
      await signOut(firebaseAuth);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center font-bold text-slate-950 text-lg">
            AT
          </div>
          <Loader2 size={28} className="text-accent animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(26,58,92,0.6),transparent_60%)]" />
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-2xl mb-4 font-bold text-slate-950 text-xl shadow-lg shadow-accent/30">
              AT
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Console</h1>
            <p className="text-slate-400 text-sm mt-1">
              Asaminew Teshome Construction
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
              <ShieldCheck size={18} className="text-accent" />
              Sign in to your account
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Enter your credentials to access the dashboard.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="admin@example.com"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-red-700 text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {loginLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
          <p className="text-slate-500 text-xs text-center mt-6 flex items-center justify-center gap-1.5">
            <Lock size={11} />
            Secure admin access only
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-slate-950 text-white transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/cms" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-slate-950 text-base shadow-md shadow-accent/20">
                AT
              </div>
              <div>
                <div className="font-bold text-sm leading-tight text-white">
                  Asaminew Teshome
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Admin Console
                </div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 px-3 mb-2 font-semibold">
            Workspace
          </div>
          <div className="space-y-1">
            {sidebarLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon size={17} />
                  <span className="flex-1">{link.label}</span>
                  {active && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer of sidebar */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-slate-950 text-xs font-bold">
              {user.email?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">
                Administrator
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user.email}
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all mb-1"
          >
            <span>←</span>
            Back to Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all w-full"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 -ml-2 p-2"
            >
              <Menu size={22} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider hidden sm:block">
                Asaminew Teshome Construction
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {getPageTitle(pathname)}
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-slate-500 text-sm w-72">
              <Search size={15} />
              <input
                placeholder="Quick search…"
                className="bg-transparent outline-none flex-1 placeholder-slate-400 text-sm"
              />
            </div>

            {/* 🔔 Notification bell with real-time updates */}
            <NotificationBell />

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold">
                {user.email?.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-100 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}