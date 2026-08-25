import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SITE_URL, isProductionSite } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const DESCRIPTION =
  "One simple link to collect tips in naira — notes from your fans, automatic payouts to your bank every Friday.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tippy — Get tipped in naira with one link",
    template: "%s · Tippy",
  },
  description: DESCRIPTION,
  applicationName: "Tippy",
  openGraph: {
    siteName: "Tippy",
    type: "website",
    locale: "en_NG",
    title: "Tippy — Get tipped in naira with one link",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  // Vercel only auto-noindexes *.vercel.app — staging.tippy.cash needs this.
  ...(isProductionSite() ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#064e5b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
