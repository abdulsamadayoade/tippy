import { redirect } from "next/navigation";
import { Overview } from "@/modules/overview";
import { getCreatorTips, getPayoutData } from "@/lib/dashboard";
import { getSessionCreator } from "@/lib/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator overview",
  description: "See your latest tips, monthly total, and upcoming payout.",
};

export default async function OverviewPage() {
  const { session, creator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (!creator) redirect("/onboarding");

  const [tips, payoutData] = await Promise.all([
    getCreatorTips(creator.id),
    getPayoutData(creator.id),
  ]);

  return (
    <Overview
      displayName={creator.displayName}
      username={creator.username}
      tips={tips}
      automaticPayoutActive={Boolean(payoutData.account) && creator.autoPayout}
    />
  );
}
