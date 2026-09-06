import { redirect } from "next/navigation";
import { Payouts } from "@/modules/payouts";
import { getPayoutData } from "@/lib/dashboard";
import { reconcileStalePayouts } from "@/lib/payouts";
import { getSessionCreator } from "@/lib/session";
import { DEFAULT_PLATFORM_FEE_BPS } from "@/data/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payouts",
  description:
    "Track your available balance, payout account, and past payouts.",
};

export default async function PayoutsPage() {
  const { session, creator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (!creator) redirect("/onboarding");

  await reconcileStalePayouts(creator.id);

  const { balance, earnings, account, payouts } = await getPayoutData(
    creator.id,
  );

  return (
    <Payouts
      balance={balance}
      earnings={earnings}
      feeBps={DEFAULT_PLATFORM_FEE_BPS}
      account={account}
      autoPayout={creator.autoPayout}
      payouts={payouts}
    />
  );
}
