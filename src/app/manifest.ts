import { brand } from "@/data/brand";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tippy",
    short_name: "Tippy",
    description:
      "One simple link to collect tips in naira — notes from your fans, automatic payouts to your bank every Friday.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "en-NG",
    categories: ["finance", "social"],
    prefer_related_applications: false,
    background_color: brand.paper,
    theme_color: brand.primary,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
