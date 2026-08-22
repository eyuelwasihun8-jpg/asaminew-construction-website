import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "Careers",
  "Join Asaminew Teshome Construction team. Explore job opportunities in civil engineering, site supervision, and construction. Build your career with us.",
  "/careers"
);

export default function CareersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
