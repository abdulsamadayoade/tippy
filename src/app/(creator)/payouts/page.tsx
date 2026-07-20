import { redirect } from "next/navigation";
import { Payouts } from "@/modules/payouts";
import { getPayoutData } from "@/lib/dashboard";
import { getSessionCreator } from "@/lib/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payouts",
  description: "Track your available balance, payout account, and past payouts.",
};

export default async function PayoutsPage() {
  const { session, creator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (!creator) redirect("/onboarding");

  const { balance, account, payouts } = await getPayoutData(creator.id);

  return (
    <Payouts
      balance={balance}
      account={account}
      autoPayout={creator.autoPayout}
      payouts={payouts}
    />
  );
}
