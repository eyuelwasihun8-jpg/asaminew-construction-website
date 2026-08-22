import type { Metadata } from "next";

const baseUrl = "https://asaminewteshome.com";

export const defaultSEO: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Asaminew Teshome Construction | Building Ethiopia's Future",
    template: "%s | Asaminew Teshome Construction",
  },
  description:
    "Asaminew Teshome Construction - Professional construction services including commercial buildings, roads, bridges, health centers, and water works across Ethiopia. Over 14 years of engineering excellence.",
  keywords: [
    "construction company Ethiopia",
    "Asaminew Teshome Construction",
    "building construction Addis Ababa",
    "road construction Ethiopia",
    "bridge construction Oromia",
    "health center construction",
    "civil engineering Ethiopia",
    "construction services Ethiopia",
    "water dam construction",
    "machinery import Ethiopia",
  ],
  authors: [{ name: "Asaminew Teshome Construction" }],
  creator: "Asaminew Teshome Construction",
  publisher: "Asaminew Teshome Construction",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Asaminew Teshome Construction",
    title: "Asaminew Teshome Construction | Building Ethiopia's Future",
    description:
      "Professional construction services including buildings, roads, bridges, and water works across Ethiopia. Over 14 years of excellence.",
    images: [
      {
        url: "/images/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Asaminew Teshome Construction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asaminew Teshome Construction",
    description:
      "Professional construction services across Ethiopia. Over 14 years of excellence.",
    images: ["/images/hero-bg.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export function generatePageSEO(
  title: string,
  description: string,
  path: string = ""
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Asaminew Teshome Construction`,
      description,
      url: `${baseUrl}${path}`,
      images: [
        {
          url: "/images/hero-bg.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title: `${title} | Asaminew Teshome Construction`,
      description,
    },
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
  };
}
