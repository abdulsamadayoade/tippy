import { Support } from "@/modules/support";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/support" },
  title: "Support",
  description: "Get help with tips, payouts, and your Tippy account.",
};

export default function SupportPage() {
  return <Support />;
}
