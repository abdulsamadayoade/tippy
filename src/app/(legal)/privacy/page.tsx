import { LegalPage } from "@/modules/legal";
import { privacyPolicy } from "@/modules/legal/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Tippy collects, why, and who it's shared with.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="What we collect, why we collect it, and who it's shared with."
      updated="21 July 2026"
      sections={privacyPolicy}
      crossLink={{ label: "Terms of Service", href: "/terms" }}
    />
  );
}
