import { and, eq, inArray, lt, ne, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccount, creator, payout, tip } from "@/lib/db/schema";
import { getTransferByReference, initiateTransfer } from "@/lib/monnify";
import { formatNaira } from "@/lib/utils";
import { MINIMUM_WITHDRAWAL } from "@/data/constants";

type DbExecutor =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

const OPEN_STATUSES = ["pending", "processing"] as const;

/** How old a pending/processing payout gets before page loads re-check it. */
const STALE_AFTER_MS = 90_000;

/**
 * A pending payout Monnify has never heard of after this long was lost before
 * submission (crash between insert and initiate) — fail it so the reserved
 * amount returns to the balance.
 */
const ABANDON_PENDING_AFTER_MS = 10 * 60_000;

const TERMINAL_FAILURE = /FAILED|REVERSED|EXPIRED|CANCELLED/;

export type PayoutSubmission = {
  id: string;
  paymentReference: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

/** Settled tips minus every payout that hasn't failed. */
export async function computeAvailableBalance(
  executor: DbExecutor,
  creatorId: string,
): Promise<number> {
  const [tipTotals, payoutTotals] = await Promise.all([
    executor
      .select({ total: sum(tip.amount) })
      .from(tip)
      .where(and(eq(tip.creatorId, creatorId), eq(tip.status, "success"))),
    executor
      .select({ total: sum(payout.amount) })
      .from(payout)
      .where(and(eq(payout.creatorId, creatorId), ne(payout.status, "failed"))),
  ]);

  const tipTotal = Number(tipTotals[0]?.total ?? 0);
  const payoutTotal = Number(payoutTotals[0]?.total ?? 0);
  return Math.max(tipTotal - payoutTotal, 0);
}

/**
 * Reserves a withdrawal: locks the creator row so concurrent requests can't
 * both pass the balance check, then inserts the pending payout that reserves
 * the amount. No external calls happen inside the transaction.
 */
export async function createPendingPayout(
  creatorId: string,
  amount: number,
): Promise<{ error: string } | { submission: PayoutSubmission }> {
  if (!Number.isInteger(amount) || amount < MINIMUM_WITHDRAWAL) {
    return {
      error: `Minimum withdrawal is ${formatNaira(MINIMUM_WITHDRAWAL)}.`,
    };
  }

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select ${creator.id} from ${creator} where ${creator.id} = ${creatorId} for update`,
    );

    const account = await tx.query.bankAccount.findFirst({
      where: eq(bankAccount.creatorId, creatorId),
      columns: {
        id: true,
        bankCode: true,
        accountNumber: true,
        accountName: true,
      },
    });

    if (!account) {
      return { error: "Add a bank account before withdrawing." };
    }

    const balance = await computeAvailableBalance(tx, creatorId);

    if (amount > balance) {
      return { error: "Amount exceeds your available balance." };
    }

    const [row] = await tx
      .insert(payout)
      .values({
        creatorId,
        bankAccountId: account.id,
        amount,
        paymentReference: `TIPPY-PO-${crypto.randomUUID()}`,
      })
      .returning({ id: payout.id, paymentReference: payout.paymentReference });

    return {
      submission: {
        id: row.id,
        paymentReference: row.paymentReference,
        amount,
        bankCode: account.bankCode,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
      },
    };
  });
}

/**
 * Sends a reserved payout to Monnify and records the outcome. On transport
 * failures the row stays pending — the reference is the idempotency key, and
 * reconciliation resolves it either way.
 */
export async function submitPayout(
  submission: PayoutSubmission,
): Promise<{ ok: boolean; error?: string }> {
  let outcome;

  try {
    outcome = await initiateTransfer({
      amount: submission.amount,
      reference: submission.paymentReference,
      narration: "Tippy payout",
      destinationBankCode: submission.bankCode,
      destinationAccountNumber: submission.accountNumber,
      destinationAccountName: submission.accountName,
    });
  } catch (error) {
    console.error(
      `Payout ${submission.paymentReference}: initiation unreachable`,
      error,
    );
    return {
      ok: false,
      error:
        "We couldn’t confirm your withdrawal with our payment provider. It’ll resolve automatically in a few minutes — check back shortly.",
    };
  }

  if (outcome.status === "SUCCESS") {
    await db
      .update(payout)
      .set({
        status: "paid",
        paidAt: new Date(),
        providerReference: outcome.providerReference,
      })
      .where(
        and(
          eq(payout.id, submission.id),
          inArray(payout.status, [...OPEN_STATUSES]),
        ),
      );
    return { ok: true };
  }

  if (outcome.status === "PENDING") {
    await db
      .update(payout)
      .set({
        status: "processing",
        providerReference: outcome.providerReference,
      })
      .where(and(eq(payout.id, submission.id), eq(payout.status, "pending")));
    return { ok: true };
  }

  await db
    .update(payout)
    .set({
      status: "failed",
      providerReference: outcome.providerReference,
      failureReason: outcome.failureReason?.slice(0, 500) ?? null,
    })
    .where(
      and(
        eq(payout.id, submission.id),
        inArray(payout.status, [...OPEN_STATUSES]),
      ),
    );

  return {
    ok: false,
    error:
      outcome.status === "OTP_REQUIRED"
        ? "Payouts are temporarily misconfigured on our side. Your balance wasn’t touched — try again later."
        : "Our payment provider declined this transfer. Your balance wasn’t touched — try again shortly.",
  };
}

/**
 * Settles an open payout against Monnify's authoritative transfer status.
 * Mirrors reconcileTipWithMonnify: used by the webhook's unsigned sandbox
 * path and by stale-payout recovery when a webhook was missed.
 */
export async function reconcilePayoutWithMonnify(
  paymentReference: string,
): Promise<"paid" | "failed" | "pending" | "processing" | "unknown"> {
  const row = await db.query.payout.findFirst({
    where: eq(payout.paymentReference, paymentReference),
    columns: { id: true, status: true, createdAt: true },
  });

  if (!row) return "unknown";
  if (row.status === "paid" || row.status === "failed") return row.status;

  const transfer = await getTransferByReference(paymentReference);

  if (!transfer) {
    const age = Date.now() - row.createdAt.getTime();

    if (row.status === "pending" && age > ABANDON_PENDING_AFTER_MS) {
      await db
        .update(payout)
        .set({
          status: "failed",
          failureReason: "The transfer never reached the payment provider.",
        })
        .where(and(eq(payout.id, row.id), eq(payout.status, "pending")));
      return "failed";
    }

    return row.status;
  }

  if (transfer.status === "SUCCESS") {
    const completedOn = transfer.completedOn
      ? new Date(transfer.completedOn)
      : null;

    await db
      .update(payout)
      .set({
        status: "paid",
        paidAt:
          completedOn && !Number.isNaN(completedOn.getTime())
            ? completedOn
            : new Date(),
      })
      .where(
        and(eq(payout.id, row.id), inArray(payout.status, [...OPEN_STATUSES])),
      );
    return "paid";
  }

  if (TERMINAL_FAILURE.test(transfer.status)) {
    await db
      .update(payout)
      .set({
        status: "failed",
        failureReason: `Provider status: ${transfer.status}`,
      })
      .where(
        and(eq(payout.id, row.id), inArray(payout.status, [...OPEN_STATUSES])),
      );
    return "failed";
  }

  // Still in flight at Monnify — make sure the row reflects that.
  if (row.status === "pending") {
    await db
      .update(payout)
      .set({ status: "processing" })
      .where(and(eq(payout.id, row.id), eq(payout.status, "pending")));
    return "processing";
  }

  return row.status;
}

/**
 * Re-checks open payouts that have outlived the normal webhook window.
 * Cheap when there's nothing stale (one indexed query, no API calls).
 */
export async function reconcileStalePayouts(creatorId: string): Promise<void> {
  const stale = await db.query.payout.findMany({
    where: and(
      eq(payout.creatorId, creatorId),
      inArray(payout.status, [...OPEN_STATUSES]),
      lt(payout.createdAt, new Date(Date.now() - STALE_AFTER_MS)),
    ),
    columns: { paymentReference: true },
    limit: 10,
  });

  for (const row of stale) {
    try {
      await reconcilePayoutWithMonnify(row.paymentReference);
    } catch (error) {
      console.error(
        `Stale payout reconciliation failed for ${row.paymentReference}`,
        error,
      );
    }
  }
}

/**
 * Friday auto-payout run: pays out the full balance of every creator with
 * auto payout on and a linked bank account. Serial on purpose — the volumes
 * are small and it keeps the wallet drawdown ordered.
 */
export async function runAutoPayouts(): Promise<
  Array<{
    creatorId: string;
    amount?: number;
    reference?: string;
    ok?: boolean;
    error?: string;
  }>
> {
  const candidates = await db
    .select({ creatorId: creator.id })
    .from(creator)
    .innerJoin(bankAccount, eq(bankAccount.creatorId, creator.id))
    .where(eq(creator.autoPayout, true));

  const results = [];

  for (const { creatorId } of candidates) {
    try {
      const balance = await computeAvailableBalance(db, creatorId);
      if (balance < MINIMUM_WITHDRAWAL) continue;

      const created = await createPendingPayout(creatorId, balance);

      if ("error" in created) {
        results.push({ creatorId, error: created.error });
        continue;
      }

      const submitted = await submitPayout(created.submission);
      results.push({
        creatorId,
        amount: created.submission.amount,
        reference: created.submission.paymentReference,
        ok: submitted.ok,
        ...(submitted.ok ? {} : { error: submitted.error }),
      });
    } catch (error) {
      console.error(`Auto payout failed for creator ${creatorId}`, error);
      results.push({
        creatorId,
        error: "Unexpected failure — see server logs.",
      });
    }
  }

  return results;
}
