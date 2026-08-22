import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "News & Blog",
  "Stay updated with the latest news, announcements, and updates from Asaminew Teshome Construction. Corporate news, project updates, and press releases.",
  "/news"
);

export default function NewsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
