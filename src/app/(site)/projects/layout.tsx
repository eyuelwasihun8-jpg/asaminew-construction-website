import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "Our Projects",
  "Explore our portfolio of construction projects across Ethiopia including schools, buildings, health centers, bridges, roads, and water structures. Serving Addis Ababa, Oromia and all Ethiopia.",
  "/projects",
  [
    "construction projects Ethiopia",
    "road projects Oromia",
    "school construction projects Ethiopia",
    "bridge projects Addis Ababa",
  ]
);

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}