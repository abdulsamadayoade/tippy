import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tip } from "@/lib/db/schema";
import { getTransactionByPaymentReference } from "@/lib/monnify";
import { sendTipSettledEmails } from "@/lib/notifications";

export type TipSettlementStatus = "success" | "failed" | "pending" | "unknown";
export type TipSettlementFacts = {
  providerReference: string | null;
  amountPaid?: number | null;
  settlementAmount?: number | null;
};

const PENDING_STATUSES = new Set(["PENDING", "PARTIALLY_PAID"]);

export async function markTipSettled(
  tipId: string,
  paymentReference: string,
  facts: TipSettlementFacts,
): Promise<boolean> {
  const updated = await db
    .update(tip)
    .set({
      status: "success",
      providerReference: facts.providerReference,
      ...(facts.amountPaid != null ? { amountPaid: facts.amountPaid } : {}),
      ...(facts.settlementAmount != null
        ? { providerSettlementAmount: facts.settlementAmount }
        : {}),
    })
    .where(and(eq(tip.id, tipId), eq(tip.status, "pending")))
    .returning({ id: tip.id });

  if (updated.length === 0) return false;

  await sendTipSettledEmails(paymentReference);
  return true;
}

export async function reconcileTipWithMonnify(
  paymentReference: string,
): Promise<TipSettlementStatus> {
  const row = await db.query.tip.findFirst({
    where: eq(tip.paymentReference, paymentReference),
    columns: { id: true, amount: true, status: true },
  });

  if (!row) return "unknown";
  if (row.status !== "pending") return row.status;

  const transaction = await getTransactionByPaymentReference(paymentReference);

  if (!transaction) return "pending";

  if (
    transaction.paymentStatus === "PAID" &&
    transaction.amountPaid >= row.amount
  ) {
    await markTipSettled(row.id, paymentReference, {
      providerReference: transaction.transactionReference,
      amountPaid: transaction.amountPaid,
      settlementAmount: transaction.settlementAmount,
    });
    return "success";
  }

  if (PENDING_STATUSES.has(transaction.paymentStatus)) return "pending";

  await db
    .update(tip)
    .set({
      status: "failed",
      providerReference: transaction.transactionReference,
    })
    .where(and(eq(tip.id, row.id), eq(tip.status, "pending")));
  return "failed";
}
