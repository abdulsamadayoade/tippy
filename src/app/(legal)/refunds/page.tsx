import { LegalPage } from "@/modules/legal";
import { refundPolicy } from "@/modules/legal/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/refunds" },
  title: "Refund & Dispute Policy",
  description: "When tips can be reversed, and how to raise a dispute.",
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund & Dispute Policy"
      intro="Tips are gifts — here's exactly when one can be reversed, and how to ask."
      updated="24 August 2026"
      sections={refundPolicy}
      crossLinks={[
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
      ]}
    />
  );
}
