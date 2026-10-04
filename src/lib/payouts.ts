import { and, eq, inArray, lt, or, isNull, asc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccount, creator, payout } from "@/lib/db/schema";
import { computeAvailableBalance } from "@/lib/ledger";
import { getTransferByReference, initiateTransfer } from "@/lib/monnify";
import {
  getMonnifyPayoutFee,
  quotePayoutFromBalance,
  sameWithdrawalQuote,
  parseProviderFee,
  providerFeeDifference,
  type WithdrawalQuote,
  type PayoutEnvironment,
} from "@/lib/payout-fees";
import { getPayoutEnvironment } from "@/lib/payout-config";
import { isAccountVerified } from "@/lib/identity-verification";
import { notifyPayoutPaid } from "@/lib/notifications";
import { reportError, reportWarning } from "@/lib/monitoring";
import { formatNaira } from "@/lib/utils";
import { MINIMUM_WITHDRAWAL } from "@/data/constants";

const OPEN_STATUSES = ["pending", "processing"] as const;
const STALE_AFTER_MS = 90_000;
const ABANDON_PENDING_AFTER_MS = 10 * 60_000;
const TERMINAL_FAILURE = /FAILED|REVERSED|EXPIRED|CANCELLED/;

export type PayoutSubmission = {
  id: string;
  paymentReference: string;
  amount: number;
  creatorFeeAmount: number;
  environment: PayoutEnvironment;
  balanceDebit: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

export async function createPendingPayout(
  creatorId: string,
  balanceAmount: number,
  {
    allowBelowMinimum = false,
    expectedQuote,
  }: { allowBelowMinimum?: boolean; expectedQuote?: WithdrawalQuote } = {},
): Promise<{ error: string } | { submission: PayoutSubmission }> {
  const environment = getPayoutEnvironment();
  let quote;
  try {
    if (balanceAmount <= getMonnifyPayoutFee(balanceAmount, environment))
      return { error: "Your balance is too low to cover the transfer fee." };
    quote = quotePayoutFromBalance(balanceAmount, environment);
  } catch {
    return { error: "Enter a valid withdrawal amount." };
  }

  if (!allowBelowMinimum && balanceAmount < MINIMUM_WITHDRAWAL) {
    return {
      error: `Minimum withdrawal is ${formatNaira(MINIMUM_WITHDRAWAL)}.`,
    };
  }

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select ${creator.id} from ${creator} where ${creator.id} = ${creatorId} for update`,
    );

    const creatorRow = await tx.query.creator.findFirst({
      where: eq(creator.id, creatorId),
      columns: { suspended: true, payoutsFrozen: true },
    });

    if (!creatorRow || creatorRow.suspended) {
      return { error: "Your account is suspended. Contact hello@tippy.cash." };
    }

    if (creatorRow.payoutsFrozen) {
      return {
        error:
          "Withdrawals are temporarily paused on your account while we review recent activity. Contact hello@tippy.cash.",
      };
    }

    const account = await tx.query.bankAccount.findFirst({
      where: eq(bankAccount.creatorId, creatorId),
    });

    if (!account) {
      return { error: "Add a bank account before withdrawing." };
    }

    if (!isAccountVerified(account, environment)) {
      return {
        error: "Verify your identity for this bank account before withdrawing.",
      };
    }
    const currentQuote: WithdrawalQuote = {
      ...quote,
      destinationId: account.id,
      destinationRevision: account.revision,
      destinationBank: account.bankName,
      destinationLast4: account.accountNumber.slice(-4),
    };
    if (expectedQuote && !sameWithdrawalQuote(expectedQuote, currentQuote)) {
      return {
        error: "Your payout details changed. Check the amounts and try again.",
      };
    }

    const balance = await computeAvailableBalance(tx, creatorId);

    if (balanceAmount > balance) {
      return { error: "Amount exceeds your available balance." };
    }

    const [row] = await tx
      .insert(payout)
      .values({
        creatorId,
        bankAccountId: account.id,
        amount: quote.bankAmount,
        creatorFeeAmount: quote.creatorFeeAmount,
        environment,
        feePolicyVersion: quote.feePolicyVersion,
        destinationRevision: account.revision,
        destinationBankName: account.bankName,
        destinationLast4: account.accountNumber.slice(-4),
        paymentReference: `TIPPY-PO-${crypto.randomUUID()}`,
      })
      .returning({ id: payout.id, paymentReference: payout.paymentReference });

    return {
      submission: {
        id: row.id,
        paymentReference: row.paymentReference,
        amount: quote.bankAmount,
        creatorFeeAmount: quote.creatorFeeAmount,
        environment,
        balanceDebit: quote.balanceDebit,
        bankCode: account.bankCode,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
      },
    };
  });
}

export async function submitPayout(
  submission: PayoutSubmission,
): Promise<{ ok: boolean; error?: string }> {
  if (submission.environment !== getPayoutEnvironment()) {
    await db
      .update(payout)
      .set({
        status: "failed",
        failureReason: "Payout configuration changed before submission.",
      })
      .where(and(eq(payout.id, submission.id), eq(payout.status, "pending")));
    return {
      ok: false,
      error:
        "Withdrawals are temporarily unavailable. Your reservation has been released.",
    };
  }
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
    reportError(error, {
      category: "payout.initiation",
      extra: { paymentReference: submission.paymentReference },
    });
    return {
      ok: false,
      error:
        "We couldn’t confirm your withdrawal. Your amount is reserved while we check with Monnify. Check your payout history before trying again.",
    };
  }
  await recordPayoutOutcome(submission.paymentReference, {
    status:
      outcome.status === "SUCCESS"
        ? "paid"
        : outcome.status === "PENDING"
          ? "processing"
          : "failed",
    actualProviderFeeAmount: outcome.providerFeeAmount,
    providerReference: outcome.providerReference,
    failureReason: outcome.failureReason,
  });
  if (outcome.status === "SUCCESS" || outcome.status === "PENDING")
    return { ok: true };
  return {
    ok: false,
    error:
      outcome.status === "OTP_REQUIRED"
        ? "Payouts need attention from our team. Your reserved balance has been released."
        : "Monnify declined the transfer. Your reserved balance has been released.",
  };
}

export async function recordPayoutOutcome(
  paymentReference: string,
  outcome: {
    status: "paid" | "failed" | "processing";
    actualProviderFeeAmount?: number | null;
    providerReference?: string | null;
    completedOn?: string | null;
    failureReason?: string | null;
  },
): Promise<"paid" | "failed" | "pending" | "processing" | "unknown"> {
  const result = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select ${payout.id} from ${payout} where ${payout.paymentReference} = ${paymentReference} for update`,
    );
    const row = await tx.query.payout.findFirst({
      where: eq(payout.paymentReference, paymentReference),
    });
    if (!row || (row.environment && row.environment !== getPayoutEnvironment()))
      return null;
    const actualFee = parseProviderFee({
      fee: outcome.actualProviderFeeAmount,
    });
    const feeChanged =
      actualFee !== null && actualFee !== row.actualProviderFeeAmount;
    const open = row.status === "pending" || row.status === "processing";
    const status = open ? outcome.status : row.status;
    const paidNow = open && status === "paid";
    // Settled rows keep their status; a contradicting result goes to a person.
    const conflict =
      !open && outcome.status !== "processing" && outcome.status !== status;
    const completedOn = outcome.completedOn
      ? new Date(outcome.completedOn)
      : new Date();
    if (
      open ||
      feeChanged ||
      (row.status === "paid" && row.actualProviderFeeAmount === null)
    ) {
      await tx
        .update(payout)
        .set({
          status,
          ...(feeChanged ? { actualProviderFeeAmount: actualFee } : {}),
          ...(outcome.providerReference
            ? { providerReference: outcome.providerReference }
            : {}),
          ...(paidNow
            ? {
                paidAt: Number.isNaN(completedOn.getTime())
                  ? new Date()
                  : completedOn,
              }
            : {}),
          ...(open && status === "failed"
            ? {
                failureReason:
                  outcome.failureReason?.slice(0, 500) ??
                  "The transfer failed.",
              }
            : {}),
        })
        .where(eq(payout.id, row.id));
    }
    return {
      status,
      paidNow,
      conflict,
      feeChanged,
      actualFee,
      creatorFee: row.creatorFeeAmount,
    };
  });
  if (!result) return "unknown";
  if (result.conflict) {
    reportError(
      new Error(
        `Monnify reported a ${outcome.status} payout that is recorded as ${result.status}`,
      ),
      {
        category: "payout.reconciliation",
        tags: { kind: "payout-outcome-conflict" },
        extra: {
          paymentReference,
          recorded: result.status,
          provider: outcome.status,
          failureReason: outcome.failureReason,
        },
        fingerprint: ["payout-outcome-conflict"],
      },
    );
  }
  if (
    result.feeChanged &&
    result.actualFee !== null &&
    result.actualFee !== result.creatorFee
  ) {
    reportWarning("Monnify payout fee differed from the creator charge", {
      category: "payout.reconciliation",
      tags: { kind: "payout-fee-mismatch" },
      extra: {
        paymentReference,
        expected: result.creatorFee,
        actual: result.actualFee,
        difference: providerFeeDifference(result.creatorFee, result.actualFee),
      },
      fingerprint: ["monnify-payout-fee-mismatch"],
    });
  }
  if (result.paidNow) await notifyPayoutPaid(paymentReference);
  return result.status;
}

export async function reconcilePayoutWithMonnify(
  paymentReference: string,
): Promise<"paid" | "failed" | "pending" | "processing" | "unknown"> {
  const row = await db.query.payout.findFirst({
    where: eq(payout.paymentReference, paymentReference),
  });
  if (!row) return "unknown";
  if (row.status === "failed") return row.status;
  if (row.environment && row.environment !== getPayoutEnvironment())
    return row.status;
  if (row.status === "paid" && row.actualProviderFeeAmount !== null)
    return row.status;
  const transfer = await getTransferByReference(paymentReference);
  if (!transfer) {
    if (
      row.status === "pending" &&
      Date.now() - row.createdAt.getTime() > ABANDON_PENDING_AFTER_MS
    ) {
      await db
        .update(payout)
        .set({
          status: "failed",
          failureReason: "The transfer never reached the payment provider.",
        })
        .where(and(eq(payout.id, row.id), eq(payout.status, "pending")));
      const current = await db.query.payout.findFirst({
        where: eq(payout.id, row.id),
        columns: { status: true },
      });
      return current?.status ?? "unknown";
    }
    if (row.status === "paid")
      await db
        .update(payout)
        .set({ updatedAt: new Date() })
        .where(eq(payout.id, row.id));
    return row.status;
  }
  return recordPayoutOutcome(paymentReference, {
    status:
      transfer.status === "SUCCESS"
        ? "paid"
        : TERMINAL_FAILURE.test(transfer.status)
          ? "failed"
          : "processing",
    actualProviderFeeAmount: transfer.providerFeeAmount,
    completedOn: transfer.completedOn,
    failureReason: `Provider status: ${transfer.status}`,
  });
}

export async function reconcileStalePayouts(creatorId: string): Promise<void> {
  const stale = await db.query.payout.findMany({
    where: and(
      eq(payout.creatorId, creatorId),
      or(
        and(
          inArray(payout.status, [...OPEN_STATUSES]),
          lt(payout.updatedAt, new Date(Date.now() - STALE_AFTER_MS)),
        ),
        and(
          eq(payout.status, "paid"),
          isNull(payout.actualProviderFeeAmount),
          sql`${payout.environment} is not null`,
          lt(payout.updatedAt, new Date(Date.now() - 86_400_000)),
        ),
      ),
    ),
    columns: { paymentReference: true },
    orderBy: [asc(payout.updatedAt)],
    limit: 10,
  });

  for (const row of stale) {
    try {
      await reconcilePayoutWithMonnify(row.paymentReference);
    } catch (error) {
      reportError(error, {
        category: "payout.reconciliation",
        extra: { paymentReference: row.paymentReference },
      });
    }
  }
}

export async function runAutoPayouts(): Promise<
  Array<{
    creatorId: string;
    amount?: number;
    reference?: string;
    ok?: boolean;
    error?: string;
  }>
> {
  const environment = getPayoutEnvironment();
  const candidates = await db
    .select({ creatorId: creator.id })
    .from(creator)
    .innerJoin(bankAccount, eq(bankAccount.creatorId, creator.id))
    .where(
      and(
        eq(creator.autoPayout, true),
        eq(creator.suspended, false),
        eq(creator.payoutsFrozen, false),
        eq(bankAccount.verificationStatus, "verified"),
        eq(bankAccount.verificationEnvironment, environment),
        eq(bankAccount.verificationRevision, bankAccount.revision),
        sql`${bankAccount.verifiedAt} is not null`,
      ),
    );

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
        amount: created.submission.balanceDebit,
        reference: created.submission.paymentReference,
        ok: submitted.ok,
        ...(submitted.ok ? {} : { error: submitted.error }),
      });
    } catch (error) {
      reportError(error, {
        category: "payout.auto",
        extra: { creatorId },
      });
      results.push({
        creatorId,
        error: "Unexpected failure — see server logs.",
      });
    }
  }

  return results;
}
