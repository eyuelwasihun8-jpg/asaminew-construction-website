import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "News & Updates",
  "Latest company news and construction project updates from Asaminew Teshome Construction across Addis Ababa, Oromia and Ethiopia.",
  "/news",
  [
    "Ethiopia construction news",
    "Asaminew Teshome news",
    "construction project updates Ethiopia",
  ]
);

export default function NewsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}