import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "Our Projects",
  "Explore our portfolio of construction projects across Ethiopia including buildings, health centers, bridges, roads, and water structures. Over 16+ completed projects.",
  "/projects"
);

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
