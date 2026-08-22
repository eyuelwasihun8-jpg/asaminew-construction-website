import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "About Us",
  "Asaminew Teshome Construction was founded by Engineer Asaminew Teshome Assefa with 14+ years of expertise in building, road, bridge and water works. Based in Lebu, Nifas Silk Lafto, Addis Ababa.",
  "/about",
  [
    "about Asaminew Teshome Construction",
    "Ethiopian construction company",
    "Engineer Asaminew Teshome Assefa",
    "construction company history Addis Ababa",
  ]
);

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}