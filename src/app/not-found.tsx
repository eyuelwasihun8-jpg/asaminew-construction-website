import Link from "next/link";
import { Home, ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />

      <div className="relative text-center max-w-lg">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            404 Error
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          The page you are looking for does not exist or has been moved. Let us
          get you back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-slate-950 font-bold px-6 py-3 rounded-lg transition-all"
          >
            <Home size={17} />
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            Contact Us
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
