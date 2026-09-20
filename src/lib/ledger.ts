import { and, eq, ne, sum } from "drizzle-orm";
import { db, type DbExecutor } from "@/lib/db";
import { adjustment, payout, tip } from "@/lib/db/schema";
import { reportWarning } from "@/lib/monitoring";

type PayoutBasis = "reserved" | "settled";

async function computeLedgerBalance(
  executor: DbExecutor,
  { creatorId, payoutBasis }: { creatorId?: string; payoutBasis: PayoutBasis },
): Promise<number> {
  const tipTotals = await executor
    .select({ total: sum(tip.amount) })
    .from(tip)
    .where(
      and(
        eq(tip.status, "success"),
        creatorId ? eq(tip.creatorId, creatorId) : undefined,
      ),
    );
  const payoutTotals = await executor
    .select({
      total: sum(payout.amount),
      fees: sum(payout.creatorFeeAmount),
    })
    .from(payout)
    .where(
      and(
        payoutBasis === "reserved"
          ? ne(payout.status, "failed")
          : eq(payout.status, "paid"),
        creatorId ? eq(payout.creatorId, creatorId) : undefined,
      ),
    );
  const adjustmentTotals = await executor
    .select({ total: sum(adjustment.amount) })
    .from(adjustment)
    .where(creatorId ? eq(adjustment.creatorId, creatorId) : undefined);

  const tips = Number(tipTotals[0]?.total ?? 0);
  const payouts = Number(payoutTotals[0]?.total ?? 0);
  const payoutFees = Number(payoutTotals[0]?.fees ?? 0);
  const adjustments = Number(adjustmentTotals[0]?.total ?? 0);

  return (
    (Math.round(tips * 100) -
      Math.round(payouts * 100) -
      Math.round(payoutFees * 100) +
      Math.round(adjustments * 100)) /
    100
  );
}

async function computeAvailableBalance(
  executor: DbExecutor,
  creatorId: string,
): Promise<number> {
  const balance = await computeLedgerBalance(executor, {
    creatorId,
    payoutBasis: "reserved",
  });

  if (balance < 0) {
    reportWarning("Creator balance is negative after adjustments", {
      category: "payout.reconciliation",
      tags: { kind: "negative-balance" },
      extra: { creatorId, balance },
      fingerprint: ["creator-negative-balance"],
    });
  }

  return Math.max(balance, 0);
}

async function computeCreatorLiability(
  executor: DbExecutor = db,
): Promise<number> {
  return computeLedgerBalance(executor, { payoutBasis: "settled" });
}

export { computeAvailableBalance, computeCreatorLiability };
