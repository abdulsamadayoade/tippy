import { redirect } from "next/navigation";
import { getPayoutEnvironment } from "@/lib/payout-config";
import { Payouts } from "@/modules/payouts";
import { getPayoutData } from "@/lib/dashboard";
import { reconcileStalePayouts } from "@/lib/payouts";
import { getSessionCreator } from "@/lib/session";
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

  const { balance, account, payouts, identityVerified, destination } =
    await getPayoutData(creator.id);

  return (
    <Payouts
      environment={getPayoutEnvironment()}
      payoutBlockReason={
        creator.suspended || creator.payoutsFrozen
          ? "Withdrawals are paused on your account. Contact hello@tippy.cash."
          : null
      }
      identityVerified={identityVerified}
      destination={destination}
      balance={balance}
      account={account}
      autoPayout={creator.autoPayout}
      payouts={payouts}
    />
  );
}
