import type { ReactNode } from "react";
import { defaultSEO } from "@/lib/seo";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata = defaultSEO;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f2440" />
      </head>
      <body className="bg-slate-100 text-slate-900 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
