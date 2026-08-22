import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Public website shell (Navbar + Footer)
 * SEO metadata is handled by:
 * - src/app/layout.tsx (global default)
 * - src/app/(site)/[page]/layout.tsx (per-page)
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}