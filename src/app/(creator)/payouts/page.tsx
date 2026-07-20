import { Payouts } from "@/modules/payouts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payouts",
  description: "Track your available balance, payout account, and past payouts.",
};

export default function PayoutsPage() {
  return <Payouts />;
}
