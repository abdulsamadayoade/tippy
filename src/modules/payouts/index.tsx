"use client";

import { useState } from "react";
import { BalanceBanner } from "./components/balance-banner";
import { PastPayouts } from "./components/past-payouts";
import { PayoutAccountCard } from "./components/payout-account-card";
import { IdentityCard } from "./components/identity-card";
import { WithdrawModal } from "./components/withdraw-modal";
import { MINIMUM_WITHDRAWAL } from "@/data/constants";
import type { PayoutsProps } from "./types";

export function Payouts({
  balance,
  account,
  autoPayout,
  payouts,
  identityVerified,
  environment,
  destinationKey,
  payoutBlockReason,
}: PayoutsProps) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const blockedReason =
    payoutBlockReason ??
    (account && !identityVerified
      ? "Verify your identity to enable withdrawals."
      : null);

  const canWithdraw =
    balance >= MINIMUM_WITHDRAWAL && Boolean(account) && !blockedReason;
  const hasReservedWithdrawal = payouts.some(
    ({ status }) => status === "pending" || status === "processing",
  );

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
        blockedReason={blockedReason}
        total={balance}
        hasAccount={Boolean(account)}
        autoPayout={autoPayout}
        canWithdraw={canWithdraw}
        withdrawalRequested={balance === 0 && hasReservedWithdrawal}
        onWithdraw={openWithdraw}
      />

      <PayoutAccountCard
        account={account}
        autoPayout={autoPayout}
        automaticPayoutBlocked={Boolean(blockedReason)}
      />

      {account && (
        <IdentityCard
          key={`${destinationKey}:${identityVerified}`}
          identityVerified={identityVerified}
          environment={environment}
        />
      )}

      <PastPayouts payouts={payouts} />

      <WithdrawModal
        key={destinationKey}
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        balance={balance}
        account={account}
      />
    </section>
  );
}
