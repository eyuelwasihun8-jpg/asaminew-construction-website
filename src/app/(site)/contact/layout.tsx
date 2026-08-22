import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "Contact Us",
  "Contact Asaminew Teshome Construction. Office: Khalifa Sabit Building, Room 3D, Nifas Silk Lafto (Lebu), Addis Ababa. Call +251 91 123 5933 or +251 93 010 0200.",
  "/contact",
  [
    "contact Asaminew Teshome Construction",
    "construction company contact Addis Ababa",
    "Lebu construction office",
    "Nifas Silk Lafto construction company",
  ]
);

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}