import { Overview } from "@/modules/overview";
import { sampleCreator } from "@/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator overview",
  description: `See ${sampleCreator.name}’s latest tips, monthly total, and upcoming payout.`,
};

export default function OverviewPage() {
  return <Overview />;
}
