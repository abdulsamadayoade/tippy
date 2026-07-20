import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tip } from "@/lib/db/schema";
import { getTransactionByPaymentReference } from "@/lib/monnify";

const PENDING_STATUSES = new Set(["PENDING", "PARTIALLY_PAID"]);

export type TipSettlementStatus = "success" | "failed" | "pending" | "unknown";

/**
 * Settles a tip against Monnify's authoritative transaction status with a
 * single API lookup. Used by the webhook's sandbox path, where Monnify omits
 * the signature header, so the event's claim is authenticated before settling.
 */
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
    await db
      .update(tip)
      .set({
        status: "success",
        providerReference: transaction.transactionReference,
      })
      .where(and(eq(tip.id, row.id), eq(tip.status, "pending")));
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
