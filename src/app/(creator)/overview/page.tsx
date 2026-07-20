import { Overview } from "@/modules/overview";
import { getSessionCreator } from "@/lib/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator overview",
  description: "See your latest tips, monthly total, and upcoming payout.",
};

export default async function OverviewPage() {
  const { creator } = await getSessionCreator();

  return (
    <Overview displayName={creator!.displayName} username={creator!.username} />
  );
}
