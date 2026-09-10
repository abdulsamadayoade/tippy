"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportError } from "@/lib/monitoring";
import { adjustment, creator, payout, tip } from "@/lib/db/schema";
import { requireAdminForAction } from "@/lib/admin-session";
import { writeAudit } from "@/lib/audit";
import { computeAvailableBalance } from "@/lib/ledger";
import { adjustmentSchema } from "../schema";
import {
  auditFields,
  requireAdminWithLimit,
  revalidateCreatorAdminViews,
} from "./internal";

export async function lookupAdjustmentReferenceAction(
  reference: string,
): Promise<{
  error?: string;
  tip?: { amount: number; creatorId: string };
}> {
  const gate = await requireAdminForAction();
  if ("error" in gate) return { error: gate.error };

  const row = await db.query.tip.findFirst({
    where: eq(tip.paymentReference, reference.trim()),
    columns: {
      amount: true,
      creatorId: true,
    },
  });

  if (!row) return {};

  return {
    tip: {
      amount: row.amount,
      creatorId: row.creatorId,
    },
  };
}

export async function createAdjustment(values: {
  creatorId: string;
  type: "refund" | "reversal" | "manual_credit" | "manual_debit";
  amount: number;
  reason: string;
  relatedReference?: string;
  allowNegative?: boolean;
}): Promise<{ error?: string }> {
  const context = await requireAdminWithLimit();
  if ("error" in context) return { error: context.error };

  const parsed = adjustmentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { creatorId, type, amount, reason, relatedReference, allowNegative } =
    parsed.data;
  const signedAmount = type === "manual_credit" ? amount : -amount;

  // Resolve the optional related reference outside the transaction — it's
  // read-only and must belong to the same creator.
  let relatedTipId: string | null = null;
  let relatedPayoutId: string | null = null;

  if (relatedReference) {
    const [tipRow, payoutRow] = await Promise.all([
      db.query.tip.findFirst({
        where: eq(tip.paymentReference, relatedReference),
        columns: { id: true, creatorId: true },
      }),
      db.query.payout.findFirst({
        where: eq(payout.paymentReference, relatedReference),
        columns: { id: true, creatorId: true },
      }),
    ]);

    const related = tipRow ?? payoutRow;
    if (!related) {
      return { error: "No tip or payout matches that reference." };
    }
    if (related.creatorId !== creatorId) {
      return { error: "That reference belongs to a different creator." };
    }
    relatedTipId = tipRow?.id ?? null;
    relatedPayoutId = payoutRow?.id ?? null;
  }

  try {
    const result = await db.transaction(async (tx) => {
      await tx.execute(
        sql`select ${creator.id} from ${creator} where ${creator.id} = ${creatorId} for update`,
      );

      const creatorRow = await tx.query.creator.findFirst({
        where: eq(creator.id, creatorId),
        columns: { id: true, username: true },
      });
      if (!creatorRow) return { error: "Creator not found." };

      if (signedAmount < 0 && !allowNegative) {
        const balance = await computeAvailableBalance(tx, creatorId);
        if (balance + signedAmount < 0) {
          return {
            error: `That debit exceeds the available balance. Tick “allow negative balance” to record it anyway.`,
          };
        }
      }

      const [row] = await tx
        .insert(adjustment)
        .values({
          creatorId,
          type,
          amount: signedAmount,
          reason,
          relatedTipId,
          relatedPayoutId,
          createdByUserId: context.session.user.id,
        })
        .returning({ id: adjustment.id });

      await writeAudit(tx, {
        ...auditFields(context),
        action: "adjustment.create",
        targetType: "creator",
        targetId: creatorId,
        details: {
          adjustmentId: row.id,
          username: creatorRow.username,
          type,
          amount: signedAmount,
          reason,
          relatedReference: relatedReference ?? null,
        },
      });

      return {};
    });

    if (result.error) return result;
  } catch (error) {
    reportError(error, {
      category: "admin.action",
      tags: { action: "adjustment.create" },
      extra: { creatorId, type },
    });
    return { error: "Couldn’t record the adjustment. Try again." };
  }

  revalidateCreatorAdminViews(creatorId);
  return {};
}
