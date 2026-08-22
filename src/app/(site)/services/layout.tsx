import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "Construction Services",
  "Full construction services in Ethiopia — school construction, bridge building, road works, commercial buildings, health centers, water dams and machinery import. Serving Addis Ababa and Oromia.",
  "/services",
  [
    "construction services Ethiopia",
    "school construction Ethiopia",
    "bridge construction Ethiopia",
    "road construction Ethiopia",
    "commercial building construction Addis Ababa",
  ]
);

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}