import { LegalPage } from "@/modules/legal";
import { terms } from "@/modules/legal/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The short, plain-language rules for using Tippy.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The short, plain-language rules for using Tippy."
      updated="21 July 2026"
      sections={terms}
      crossLink={{ label: "Privacy Policy", href: "/privacy" }}
    />
  );
}
