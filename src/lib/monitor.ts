import * as Sentry from "@sentry/nextjs";
import { and, eq, gt, inArray, lt, sum, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { payout, tip } from "@/lib/db/schema";
import { getWalletBalance } from "@/lib/monnify";
import {
  reportError,
  reportWarning,
  resolveSentryEnvironment,
} from "@/lib/monitoring";
import { reconcileTipWithMonnify } from "@/lib/tips";
import { reconcilePayoutWithMonnify } from "@/lib/payouts";

/**
 * Sentry.withMonitor, production only. A single check-in from any other
 * environment would make Sentry expect that environment to keep the schedule
 * forever, raising missed-check-in issues for runs that were never going to
 * happen (e.g. a manual staging rehearsal of the Friday payout cron).
 * Lives here rather than in monitoring.ts because withMonitor is server-only
 * and monitoring.ts is shared with the client bundle.
 */
export function withCronMonitor<T>(
  monitorSlug: string,
  callback: () => T,
  monitorConfig: Parameters<typeof Sentry.withMonitor>[2],
): T {
  if (resolveSentryEnvironment() !== "production") return callback();
  return Sentry.withMonitor(monitorSlug, callback, monitorConfig);
}

/** A paid tip should settle via webhook within seconds; older than this and
 *  still pending means either an abandoned checkout or a missed webhook. */
const TIP_STALE_MS = 10 * 60_000;
/** Pending tips Monnify has no payment for are expired (failed) after this. */
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
};

function walletFloor(): number {
  const parsed = Number(process.env.PAYOUT_WALLET_LOW_BALANCE ?? 10_000);
  return Number.isFinite(parsed) ? parsed : 10_000;
}

/** Everything owed but not yet paid out: open payouts in flight plus every
 *  creator's undisbursed balance. The wallet must be able to cover this. */
async function computeCreatorLiability(): Promise<number> {
  const [[tipTotals], [paidTotals]] = await Promise.all([
    db
      .select({ total: sum(tip.amount) })
      .from(tip)
      .where(eq(tip.status, "success")),
    db
      .select({ total: sum(payout.amount) })
      .from(payout)
      .where(eq(payout.status, "paid")),
  ]);

  return Number(tipTotals?.total ?? 0) - Number(paidTotals?.total ?? 0);
}

/**
 * Reconciles pending tips old enough that their webhook should have long
 * arrived. Alerts ONLY when Monnify says the tip was PAID — money received
 * but the creator not credited (missed webhook). Plain abandoned checkouts
 * reconcile to pending/failed silently, and rows older than 24h that Monnify
 * has no payment for are expired to failed to keep the backlog bounded.
 */
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

/**
 * Reconciles payouts open longer than 15 minutes. reconcilePayoutWithMonnify
 * already fails pending rows Monnify never saw, so anything still open after
 * reconcile is genuinely stuck in flight — that's the alert.
 */
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
      inArray(payout.status, ["pending", "processing"]),
      lt(payout.createdAt, new Date(Date.now() - PAYOUT_STALE_MS)),
    ),
    columns: { paymentReference: true, createdAt: true },
    orderBy: [asc(payout.createdAt)],
    limit: BATCH_LIMIT,
  });

  for (const row of stalePayouts) {
    summary.checked++;
    try {
      const result = await reconcilePayoutWithMonnify(row.paymentReference);
      if (result === "pending" || result === "processing") {
        summary.stillOpen++;
        stuck.push(row.paymentReference);
        oldestCreatedAt ??= row.createdAt;
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

/** Warns when the wallet drops below what's owed to creators (or the floor). */
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

/**
 * Pre-run check for the Friday cron: can the wallet cover everything the run
 * could disburse? Warn-only and swallows its own errors — a wallet-API blip
 * must never block payouts (individual transfer failures alert separately).
 */
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

/** The full sweep. Each phase is isolated so one failure can't blind the rest. */
export async function runMonitorSweep(): Promise<MonitorSweepSummary> {
  let tips: TipSummary = {
    checked: 0,
    recovered: 0,
    closed: 0,
    expired: 0,
    stillPending: 0,
    errors: 0,
  };
  let payouts: PayoutSummary = { checked: 0, closed: 0, stillOpen: 0, errors: 0 };
  let wallet: WalletSummary = { checked: false, low: false, errors: 0 };

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

  return { tips, payouts, wallet };
}
