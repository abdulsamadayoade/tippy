import type { Metadata } from "next";
import { About } from "@/modules/about";

const description =
  "Meet Tippy: a simple way for Nigerian creators to receive tips in naira. Learn how it works, who runs it, and how to reach us.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Tippy",
    description,
    url: "/about",
    siteName: "Tippy",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Tippy",
    description,
  },
};

export default function AboutPage() {
  return <About />;
}
