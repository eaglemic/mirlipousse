
export const SITE_ORIGIN = "https://mirlipousse.onrender.com";
export const EDITORIAL_DATE = "2026-10-27";
export const SHARE_IMAGE = "/media/mini-et-merveilles-partage.png";
export const absoluteUrl = (path: string) => new URL(path, SITE_ORIGIN).href;

export function pageMetadata(title: string, description: string, path: string, indexable = true) {
  return {
    title, description,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: indexable, follow: true, googleBot: { index: indexable, follow: true, "max-image-preview": "large" } },
    openGraph: {
      type: "website", siteName: "Mini & Merveilles", locale: "fr_FR", title, description,
      url: absoluteUrl(path), images: [{ url: absoluteUrl(SHARE_IMAGE), width: 1200, height: 630, alt: "Mini & Merveilles : un univers de jeux, de couleurs et de petites grandes découvertes" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(SHARE_IMAGE)] },
  };
}

export function schemaJson(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const websiteSchema = {
  "@context": "https://schema.org", "@type": "WebSite", "@id": absoluteUrl("/#website"),
  name: "Mini & Merveilles", url: SITE_ORIGIN + "/", inLanguage: "fr",
  description: "Jouets, idées créatives et accessoires pour enfants de 0 à 12 ans. Un projet de boutique pour les familles en France et en Belgique.",
};
