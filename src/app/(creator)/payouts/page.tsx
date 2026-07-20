import { Payouts } from "@/modules/payouts";
import { sampleCreator } from "@/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payouts",
  description: `Track ${sampleCreator.name}’s available balance, payout account, and past payouts.`,
};

export default function PayoutsPage() {
  return <Payouts />;
}
