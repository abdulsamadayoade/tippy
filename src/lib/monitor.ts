import * as Sentry from "@sentry/nextjs";
import {
  and,
  eq,
  gt,
  inArray,
  lt,
  asc,
  desc,
  or,
  isNull,
  sql,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { payout, tip } from "@/lib/db/schema";
import { computeCreatorLiability } from "@/lib/ledger";
import { getWalletBalance } from "@/lib/monnify";
import {
  reportError,
  reportWarning,
  resolveSentryEnvironment,
} from "@/lib/monitoring";
import { reconcileTipWithMonnify } from "@/lib/tips";
import { reconcilePayoutWithMonnify } from "@/lib/payouts";
import { pruneRateLimits } from "@/lib/rate-limit";
import { sweepRiskFlags, type RiskSummary } from "@/lib/risk-flags";

export { computeCreatorLiability };

export function withCronMonitor<T>(
  monitorSlug: string,
  callback: () => T,
  monitorConfig: Parameters<typeof Sentry.withMonitor>[2],
): T {
  if (resolveSentryEnvironment() !== "production") return callback();
  return Sentry.withMonitor(monitorSlug, callback, monitorConfig);
}

const TIP_STALE_MS = 10 * 60_000;
const TIP_EXPIRE_MS = 24 * 60 * 60_000;
const PAYOUT_STALE_MS = 15 * 60_000;
const BATCH_LIMIT = 25;

type TipSummary = {
  checked: number;
  recovered: number;
  closed: number;
  expired: number;
  stillPending: number;
  errors: number;
};

type PayoutSummary = {
  checked: number;
  closed: number;
  stillOpen: number;
  errors: number;
};

type WalletSummary = {
  checked: boolean;
  low: boolean;
  errors: number;
};

export type MonitorSweepSummary = {
  tips: TipSummary;
  payouts: PayoutSummary;
  wallet: WalletSummary;
  risk: RiskSummary;
};

function walletFloor(): number {
  const parsed = Number(process.env.PAYOUT_WALLET_LOW_BALANCE ?? 10_000);
  return Number.isFinite(parsed) ? parsed : 10_000;
}

async function sweepTips(): Promise<TipSummary> {
  const summary: TipSummary = {
    checked: 0,
    recovered: 0,
    closed: 0,
    expired: 0,
    stillPending: 0,
    errors: 0,
  };
  const recovered: string[] = [];
  const now = Date.now();

  // Recovery pass, newest first: a missed-webhook PAID tip is by definition
  // recent. Uses tip_status_idx.
  const staleTips = await db.query.tip.findMany({
    where: and(
      eq(tip.status, "pending"),
      lt(tip.createdAt, new Date(now - TIP_STALE_MS)),
      gt(tip.createdAt, new Date(now - TIP_EXPIRE_MS)),
    ),
    columns: { paymentReference: true },
    orderBy: [desc(tip.createdAt)],
    limit: BATCH_LIMIT,
  });

  for (const { paymentReference } of staleTips) {
    summary.checked++;
    try {
      const result = await reconcileTipWithMonnify(paymentReference);
      if (result === "success") {
        summary.recovered++;
        recovered.push(paymentReference);
      } else if (result === "failed") {
        summary.closed++;
      } else {
        summary.stillPending++;
      }
    } catch (error) {
      summary.errors++;
      reportError(error, {
        category: "tip.settlement",
        tags: { kind: "monitor-sweep" },
        extra: { paymentReference },
      });
    }
  }

  // Expiry pass, oldest first: reconcile once more for safety (settle if the
  // money actually arrived), then fail what Monnify has no payment for.
  const expiredTips = await db.query.tip.findMany({
    where: and(
      eq(tip.status, "pending"),
      lt(tip.createdAt, new Date(now - TIP_EXPIRE_MS)),
    ),
    columns: { paymentReference: true },
    orderBy: [asc(tip.createdAt)],
    limit: BATCH_LIMIT,
  });

  for (const { paymentReference } of expiredTips) {
    summary.checked++;
    try {
      const result = await reconcileTipWithMonnify(paymentReference);
      if (result === "success") {
        summary.recovered++;
        recovered.push(paymentReference);
      } else if (result === "failed") {
        summary.closed++;
      } else {
        await db
          .update(tip)
          .set({ status: "failed" })
          .where(
            and(
              eq(tip.paymentReference, paymentReference),
              eq(tip.status, "pending"),
            ),
          );
        summary.expired++;
      }
    } catch (error) {
      summary.errors++;
      reportError(error, {
        category: "tip.settlement",
        tags: { kind: "monitor-sweep" },
        extra: { paymentReference },
      });
    }
  }

  // One aggregated event per run keeps the route safe under any caller cadence.
  if (recovered.length > 0) {
    reportWarning(
      `Monitor sweep settled ${recovered.length} tip(s) whose webhook was missed`,
      {
        category: "tip.settlement",
        tags: { kind: "sweep-missed-webhook" },
        extra: { references: recovered },
        fingerprint: ["sweep-missed-tip-webhook"],
      },
    );
  }

  return summary;
}

async function sweepPayouts(): Promise<PayoutSummary> {
  const summary: PayoutSummary = {
    checked: 0,
    closed: 0,
    stillOpen: 0,
    errors: 0,
  };
  const stuck: string[] = [];
  let oldestCreatedAt: Date | null = null;

  const stalePayouts = await db.query.payout.findMany({
    where: and(
      or(
        and(
          inArray(payout.status, ["pending", "processing"]),
          lt(payout.createdAt, new Date(Date.now() - PAYOUT_STALE_MS)),
        ),
        and(
          eq(payout.status, "paid"),
          isNull(payout.actualProviderFeeAmount),
          sql`${payout.environment} is not null`,
          lt(payout.updatedAt, new Date(Date.now() - 86_400_000)),
        ),
      ),
    ),
    columns: { paymentReference: true, createdAt: true },
    orderBy: [asc(payout.updatedAt)],
    limit: BATCH_LIMIT,
  });

  for (const row of stalePayouts) {
    summary.checked++;
    try {
      const result = await reconcilePayoutWithMonnify(row.paymentReference);
      if (result === "pending" || result === "processing") {
        summary.stillOpen++;
        stuck.push(row.paymentReference);
        if (!oldestCreatedAt || row.createdAt < oldestCreatedAt)
          oldestCreatedAt = row.createdAt;
      } else {
        summary.closed++;
      }
    } catch (error) {
      summary.errors++;
      reportError(error, {
        category: "payout.reconciliation",
        tags: { kind: "monitor-sweep" },
        extra: { paymentReference: row.paymentReference },
      });
    }
  }

  if (stuck.length > 0) {
    reportWarning(`${stuck.length} payout(s) still in flight after reconcile`, {
      category: "payout.reconciliation",
      tags: { kind: "sweep-stuck-payout" },
      extra: {
        references: stuck,
        oldestAgeMinutes: oldestCreatedAt
          ? Math.round((Date.now() - oldestCreatedAt.getTime()) / 60_000)
          : null,
      },
      fingerprint: ["sweep-stuck-payouts"],
    });
  }

  return summary;
}

async function checkWalletBalance(): Promise<WalletSummary> {
  try {
    const liability = await computeCreatorLiability();
    const threshold = Math.max(walletFloor(), liability);
    if (threshold <= 0) return { checked: false, low: false, errors: 0 };

    const balance = await getWalletBalance();
    const low = balance < threshold;

    if (low) {
      reportWarning("Payout wallet balance is low", {
        category: "wallet.balance",
        extra: { balance, threshold, liability },
        fingerprint: ["payout-wallet-low"],
      });
    }
    return { checked: true, low, errors: 0 };
  } catch (error) {
    reportError(error, {
      category: "wallet.balance",
      fingerprint: ["wallet-balance-check-failed"],
    });
    return { checked: false, low: false, errors: 1 };
  }
}

export async function checkWalletCoverageForAutoPayouts(): Promise<void> {
  try {
    const liability = await computeCreatorLiability();
    if (liability <= 0) return;

    const balance = await getWalletBalance();
    if (balance < liability) {
      reportWarning("Wallet may not cover the auto payout run", {
        category: "wallet.balance",
        extra: { balance, liability },
        fingerprint: ["payout-wallet-shortfall-prerun"],
      });
    }
  } catch (error) {
    reportError(error, {
      category: "wallet.balance",
      fingerprint: ["wallet-balance-check-failed"],
    });
  }
}

export async function runMonitorSweep(): Promise<MonitorSweepSummary> {
  let tips: TipSummary = {
    checked: 0,
    recovered: 0,
    closed: 0,
    expired: 0,
    stillPending: 0,
    errors: 0,
  };
  let payouts: PayoutSummary = {
    checked: 0,
    closed: 0,
    stillOpen: 0,
    errors: 0,
  };
  let wallet: WalletSummary = { checked: false, low: false, errors: 0 };
  let risk: RiskSummary = { candidates: 0, flagged: 0, errors: 0 };

  try {
    tips = await sweepTips();
  } catch (error) {
    tips.errors++;
    reportError(error, {
      category: "monitor.sweep",
      tags: { phase: "tips" },
      fingerprint: ["monitor-sweep-phase-failed", "tips"],
    });
  }

  try {
    payouts = await sweepPayouts();
  } catch (error) {
    payouts.errors++;
    reportError(error, {
      category: "monitor.sweep",
      tags: { phase: "payouts" },
      fingerprint: ["monitor-sweep-phase-failed", "payouts"],
    });
  }

  wallet = await checkWalletBalance();

  try {
    risk = await sweepRiskFlags();
  } catch (error) {
    risk.errors++;
    reportError(error, {
      category: "monitor.sweep",
      tags: { phase: "risk" },
      fingerprint: ["monitor-sweep-phase-failed", "risk"],
    });
  }

  try {
    await pruneRateLimits();
  } catch (error) {
    reportError(error, {
      category: "monitor.sweep",
      tags: { phase: "rate-limit" },
      fingerprint: ["monitor-sweep-phase-failed", "rate-limit"],
    });
  }

  return { tips, payouts, wallet, risk };
}
