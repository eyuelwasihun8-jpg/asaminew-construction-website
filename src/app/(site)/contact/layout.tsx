import type { ReactNode } from "react";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO(
  "Contact Us",
  "Contact Asaminew Teshome Construction. Located in Addis Ababa, Nifas Silk Lafto. Call +251911235933 or email asaminewteshome2025@gmail.com for inquiries.",
  "/contact"
);

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
