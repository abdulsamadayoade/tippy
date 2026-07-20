"use client";

import { useState } from "react";
import { usePayoutAccount, useTips } from "@/store/providers";
import { initialPayouts } from "@/data";
import { getTipSummary } from "@/lib/utils";
import { BalanceBanner } from "./components/balance-banner";
import { PastPayouts } from "./components/past-payouts";
import { PayoutAccountCard } from "./components/payout-account-card";
import { WithdrawModal } from "./components/withdraw-modal";

export function Payouts() {
  const { tips } = useTips();
  const { account, autoPayout } = usePayoutAccount();
  const balance = getTipSummary(tips).total;
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawalRequested, setWithdrawalRequested] = useState(false);
  const canWithdraw = balance > 0 && Boolean(account) && !withdrawalRequested;

  function openWithdraw() {
    if (!canWithdraw) return;
    setWithdrawOpen(true);
  }

  return (
    <section id="creator-payouts-panel" aria-labelledby="creator-payouts-link">
      <h1 className="mt-0.5 text-lg leading-page-heading font-medium tracking-display text-main-heading">
        Payouts
      </h1>
      <p className="mt-0.5 text-ui-sm text-muted-text">
        Track your available balance and payout history.
      </p>

      <BalanceBanner
        total={balance}
        hasAccount={Boolean(account)}
        autoPayout={autoPayout}
        canWithdraw={canWithdraw}
        withdrawalRequested={withdrawalRequested}
        onWithdraw={openWithdraw}
      />

      <PayoutAccountCard />

      <PastPayouts payouts={initialPayouts} />

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        balance={balance}
        account={account}
        requested={withdrawalRequested}
        onConfirm={() => setWithdrawalRequested(true)}
      />
    </section>
  );
}
