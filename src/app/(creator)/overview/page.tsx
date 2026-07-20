import { redirect } from "next/navigation";
import { Overview } from "@/modules/overview";
import { getPayoutData, getTipStats, getTipsPage } from "@/lib/dashboard";
import { getSessionCreator } from "@/lib/session";
import { OVERVIEW_RECENT_TIPS } from "@/data/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator overview",
  description: "See your latest tips, monthly total, and upcoming payout.",
};

export default async function OverviewPage() {
  const { session, creator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (!creator) redirect("/onboarding");

  const [stats, recentTips, payoutData] = await Promise.all([
    getTipStats(creator.id),
    getTipsPage(creator.id, { limit: OVERVIEW_RECENT_TIPS }),
    getPayoutData(creator.id),
  ]);

  return (
    <Overview
      displayName={creator.displayName}
      username={creator.username}
      tips={recentTips.tips}
      summary={stats.summary}
      periodTotals={stats.periods}
      automaticPayoutActive={Boolean(payoutData.account) && creator.autoPayout}
    />
  );
}
