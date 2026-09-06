import type { MetadataRoute } from "next";

/**
 * PWA manifest. Android and Chrome read this for install prompts and the
 * home-screen icon; Google Search Console reads it for site identity.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nakhatra — Precision Vedic Astrology",
    short_name: "Nakhatra",
    description:
      "Your chart, computed exactly by Swiss Ephemeris. Your questions, answered from it.",
    start_url: "/",
    display: "standalone",
    background_color: "#090A10",
    theme_color: "#090A10",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Maskable icons are padded so Android can crop them to any shape
      // without clipping the mark.
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
