/**
 * ============================================================
 * CENTRALIZED CLOUDINARY IMAGE URLS
 * ============================================================
 * All images MUST be hosted on Cloudinary.
 * No local images allowed — everything comes from Cloudinary CDN.
 *
 * HOW TO ADD/CHANGE AN IMAGE:
 * 1. Upload the image to your Cloudinary account
 * 2. Copy the image URL (should start with https://res.cloudinary.com/)
 * 3. Paste it in the correct place below
 * 4. RECOMMENDED: Add "f_auto,q_auto" for auto optimization
 *
 * EXAMPLE URL FORMAT:
 * https://res.cloudinary.com/sxe9lc5o/image/upload/f_auto,q_auto/v1234567890/hero-home.jpg
 *
 * Leave a value empty ("") if you haven't uploaded that image yet —
 * the code will show a nice placeholder instead of breaking.
 * ============================================================
 */

export const images = {
  // ==========================================
  // BRAND / LOGO
  // ==========================================
  logo: {
    main:
      "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787391521/Screenshot_2026-08-22_123738.png",
    // Optional transparent version if you upload one later:
    // transparent: "https://res.cloudinary.com/sxe9lc5o/image/upload/....png",
  },

  // ==========================================
  // PAGE HERO BACKGROUNDS
  // ==========================================
  hero: {
    home: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385097/photo_2025-07-03_20-48-07_2.jpg",
    about: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385084/photo_2025-07-08_20-38-13_3.jpg",
    services: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385075/photo_2025-05-01_19-35-28.jpg",
    projects: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385054/photo_2025-07-08_20-38-12.jpg",
    news: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385091/photo_2025-01-23_08-41-39.jpg",
    careers: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385071/photo_2025-07-10_15-56-02.jpg",
    contact: "",
  },

  // ==========================================
  // ABOUT PAGE / SECTION IMAGES
  // ==========================================
  about: {
    story: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385093/photo_2026-08-14_12-01-14_3.jpg",
    preview: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385071/photo_2025-07-10_15-56-02.jpg",
    ceo: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787564829/photo_2026-08-24_12-45-07.jpg",
  },

  // ==========================================
  // SERVICES PAGE - detailed service card images
  // ==========================================
  services: {
    commercialBuilding: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385090/photo_2026-08-14_12-01-14.jpg",
    healthCenter: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385111/photo_2026-08-19_11-16-20.jpg",
    bridge: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385097/photo_2025-01-23_08-43-06.jpg",
    road: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385084/photo_2025-07-08_20-38-13_3.jpg",
    waterDam: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385073/photo_2025-05-01_19-35-25.jpg",
    machinery: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787564842/OIP.webp",
  },

  // ==========================================
  // FALLBACK IMAGES
  // Used when a project/news post has no image
  // ==========================================
  fallback: {
    project: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385050/photo_2025-07-08_20-38-13_2.jpg",
    news: "https://res.cloudinary.com/sxe9lc5o/image/upload/v1787385075/photo_2025-05-01_19-35-28.jpg",
  },
};

// Helper function to check if an image URL is valid
export function hasImage(url: string | undefined | null): boolean {
  return !!url && url.trim() !== "" && url.startsWith("http");
}