import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* 
        Resource hints:
        These start DNS/TLS connections earlier for services used by
        public pages: Firestore project/vacancy data and Cloudinary images/uploads.
      */}

      {/* Firestore — projects, vacancies, contact submissions, applications */}
      <link
        rel="preconnect"
        href="https://firestore.googleapis.com"
        crossOrigin="anonymous"
      />

      {/* Cloudinary image delivery */}
      <link
        rel="preconnect"
        href="https://res.cloudinary.com"
        crossOrigin="anonymous"
      />

      {/* Cloudinary upload API — DNS is warmed without opening an unnecessary connection */}
      <link rel="dns-prefetch" href="https://api.cloudinary.com" />

      {/* Firebase Authentication — only used when administrator opens CMS */}
      <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
      <link rel="dns-prefetch" href="https://securetoken.googleapis.com" />

      <Navbar />

      <main className="min-h-screen">{children}</main>

      <Footer />
    </>
  );
}