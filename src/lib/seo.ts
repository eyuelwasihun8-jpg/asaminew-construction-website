import type { Metadata } from "next";

/** Production domain */
export const siteConfig = {
  name: "Asaminew Teshome Construction",
  legalName: "Asaminew Teshome Construction",
  shortName: "ATC",
  tagline: "We Struggle to Build Our Future",
  founder: "Engineer Asaminew Teshome Assefa",
  founded: "2010",
  domain: "asamnewteshomeconstruction.com",
  url: "https://asamnewteshomeconstruction.com",
  email: "asaminewteshome2025@gmail.com",
  phone: ["+251911235933", "+251930100200"],
  phoneDisplay: ["+251 91 123 5933", "+251 93 010 0200"],
  hours: "Mon–Fri: 8:00 AM – 5:00 PM, Sat: 8:00 AM – 12:30 PM",
  address: {
    street:
      "Khalifa Sabit Building, Room No 3D, Around Zemen Fuel Station, Nifas Silk Lafto",
    area: "Lebu",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    countryCode: "ET",
    full:
      "Addis Ababa, Nifas Silk Lafto, Around Zemen Fuel Station, Khalifa Sabit Building Room No 3D",
  },
  // Approximate coordinates for Nifas Silk Lafto / Lebu area
  geo: {
    latitude: 8.9617,
    longitude: 38.7278,
  },
  logo:
    "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787391289/Screenshot_2026-08-22_122311.png",
  ogImage:
    "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787391289/Screenshot_2026-08-22_122311.png",
  social: {
    linkedin: "https://www.linkedin.com/",
    facebook: "https://www.facebook.com/",
    twitter: "https://twitter.com/",
  },
  description:
    "Asaminew Teshome Construction is a leading Ethiopian construction company based in Addis Ababa (Nifas Silk Lafto / Lebu). We build schools, bridges, commercial buildings, roads, health centers, and water works across Addis Ababa, Oromia, and Ethiopia. 14+ years of engineering excellence.",
  keywords: [
    // Brand
    "Asaminew Teshome Construction",
    "Asaminew Teshome Construction Group",
    "ATC construction Ethiopia",
    // Core local
    "construction company Ethiopia",
    "construction company Addis Ababa",
    "construction company Lebu",
    "construction company Nifas Silk Lafto",
    "building contractor Addis Ababa",
    "building contractor Oromia",
    // Services / project types
    "school construction Ethiopia",
    "school building contractor Addis Ababa",
    "bridge construction Ethiopia",
    "bridge construction Oromia",
    "road construction Ethiopia",
    "road construction Oromia",
    "asphalt road construction Ethiopia",
    "gravel road construction Ethiopia",
    "commercial building construction Addis Ababa",
    "health center construction Ethiopia",
    "hospital construction Ethiopia",
    "water dam construction Ethiopia",
    "irrigation construction Ethiopia",
    "civil engineering Ethiopia",
    "infrastructure contractor Ethiopia",
    "government construction contractor Ethiopia",
    "machinery import Ethiopia",
  ],
  services: [
    "Commercial Building Construction",
    "School Construction",
    "Health Center Construction",
    "Bridge Construction",
    "Road Construction",
    "Water & Dam Structures",
    "Civil Engineering",
    "Machinery Import",
  ],
  regionsServed: [
    "Addis Ababa",
    "Oromia Region",
    "Amhara Region",
    "SNNPR",
    "All Ethiopia",
  ],
};

const baseUrl = siteConfig.url;

export const defaultSEO: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${siteConfig.name} | Construction Company in Addis Ababa & Ethiopia`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: baseUrl }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  category: "Construction",
  classification: "Construction Company",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "en-ET": baseUrl,
      en: baseUrl,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_ET",
    alternateLocale: ["en_US", "am_ET"],
    url: baseUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Roads, Bridges, Schools & Buildings in Ethiopia`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Construction Company in Ethiopia`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Building Ethiopia's Future`,
    description:
      "Schools, bridges, roads, buildings & water works across Addis Ababa, Oromia and Ethiopia. 14+ years of excellence.",
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: siteConfig.logo, type: "image/png" }],
    apple: siteConfig.logo,
  },
  verification: {
    // Replace after Google Search Console setup
    google: "google-site-verification-code",
  },
  other: {
    "geo.region": "ET-AA",
    "geo.placename": "Addis Ababa, Nifas Silk Lafto, Lebu",
    "geo.position": `${siteConfig.geo.latitude};${siteConfig.geo.longitude}`,
    ICBM: `${siteConfig.geo.latitude}, ${siteConfig.geo.longitude}`,
    "business:contact_data:street_address": siteConfig.address.street,
    "business:contact_data:locality": siteConfig.address.city,
    "business:contact_data:region": siteConfig.address.region,
    "business:contact_data:country_name": siteConfig.address.country,
    "business:contact_data:email": siteConfig.email,
    "business:contact_data:phone_number": siteConfig.phone[0],
  },
};

/** Helper for page-level metadata */
export function generatePageSEO(
  title: string,
  description: string,
  path: string = "",
  keywords: string[] = []
): Metadata {
  const url = `${baseUrl}${path}`;
  return {
    title,
    description,
    keywords: [...keywords, ...siteConfig.keywords.slice(0, 10)],
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      locale: "en_ET",
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [siteConfig.ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

/** JSON-LD: Local Business / General Contractor */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${baseUrl}/#business`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    alternateName: [
      "Asaminew Teshome Construction Group",
      "ATC Construction Ethiopia",
    ],
    description: siteConfig.description,
    url: baseUrl,
    logo: siteConfig.logo,
    image: siteConfig.ogImage,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    foundingDate: siteConfig.founded,
    slogan: siteConfig.tagline,
    founder: {
      "@type": "Person",
      name: siteConfig.founder,
      jobTitle: "Founder & Professional Engineer",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${siteConfig.geo.latitude},${siteConfig.geo.longitude}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "12:30",
      },
    ],
    areaServed: siteConfig.regionsServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    serviceType: siteConfig.services,
    knowsAbout: siteConfig.services,
    priceRange: "$$",
    currenciesAccepted: "ETB",
    paymentAccepted: "Cash, Bank Transfer",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.phone[0],
        contactType: "customer service",
        email: siteConfig.email,
        areaServed: "ET",
        availableLanguage: ["English", "Amharic", "Afaan Oromo"],
      },
      {
        "@type": "ContactPoint",
        telephone: siteConfig.phone[1],
        contactType: "sales",
        areaServed: "ET",
        availableLanguage: ["English", "Amharic"],
      },
    ],
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: siteConfig.name,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: siteConfig.logo,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone[0],
      contactType: "customer service",
      email: siteConfig.email,
      areaServed: "ET",
      availableLanguage: ["English", "Amharic", "Afaan Oromo"],
    },
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${baseUrl}/#organization` },
    inLanguage: "en-ET",
  };
}

export function getBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

/** Prebuilt page SEO helpers */
export const pageSEO = {
  home: generatePageSEO(
    "Construction Company in Addis Ababa & Ethiopia",
    "Asaminew Teshome Construction builds schools, bridges, roads, commercial buildings, health centers and water works across Addis Ababa, Oromia and Ethiopia. 14+ years of quality construction.",
    "",
    [
      "construction company Addis Ababa",
      "school construction Ethiopia",
      "bridge construction Ethiopia",
      "road construction Oromia",
    ]
  ),
  about: generatePageSEO(
    "About Us – Ethiopian Construction Company Since 2010",
    "Founded by Engineer Asaminew Teshome Assefa. Learn about our 14+ years building schools, bridges, roads and buildings across Ethiopia from our Addis Ababa office in Nifas Silk Lafto / Lebu.",
    "/about",
    ["about Asaminew Teshome Construction", "Engineer Asaminew Teshome Assefa"]
  ),
  services: generatePageSEO(
    "Construction Services – Schools, Bridges, Roads & Buildings",
    "Full construction services in Ethiopia: school construction, bridge building, road works, commercial buildings, health centers, water dams and machinery import. Serving Addis Ababa and Oromia.",
    "/services",
    [
      "school construction Ethiopia",
      "bridge construction services",
      "road construction services Ethiopia",
    ]
  ),
  projects: generatePageSEO(
    "Our Projects – Construction Portfolio Across Ethiopia",
    "View completed and ongoing construction projects by Asaminew Teshome Construction: schools, bridges, roads, buildings and infrastructure across Addis Ababa, Oromia and Ethiopia.",
    "/projects",
    ["construction projects Ethiopia", "road projects Oromia"]
  ),
  careers: generatePageSEO(
    "Careers – Construction Jobs in Addis Ababa & Ethiopia",
    "Join Asaminew Teshome Construction. Open roles for civil engineers, site supervisors, equipment operators and construction professionals in Addis Ababa and across Ethiopia.",
    "/careers",
    ["construction jobs Addis Ababa", "civil engineer jobs Ethiopia"]
  ),
  news: generatePageSEO(
    "News & Updates",
    "Latest project news and company updates from Asaminew Teshome Construction Group in Ethiopia.",
    "/news"
  ),
  contact: generatePageSEO(
    "Contact Us – Lebu / Nifas Silk Lafto, Addis Ababa",
    "Contact Asaminew Teshome Construction. Office: Khalifa Sabit Building, Room 3D, Nifas Silk Lafto (Lebu), Addis Ababa. Call +251 91 123 5933 or +251 93 010 0200.",
    "/contact",
    [
      "contact construction company Addis Ababa",
      "Lebu construction office",
      "Nifas Silk Lafto contractor",
    ]
  ),
};