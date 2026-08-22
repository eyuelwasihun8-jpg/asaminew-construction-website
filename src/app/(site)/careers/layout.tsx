import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "Careers & Vacancies",
  "Join Asaminew Teshome Construction. Open positions for civil engineers, site supervisors, equipment operators and construction professionals in Addis Ababa and across Ethiopia.",
  "/careers",
  [
    "construction jobs Ethiopia",
    "civil engineer jobs Addis Ababa",
    "site supervisor jobs Ethiopia",
    "construction careers Oromia",
  ]
);

export default function CareersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}