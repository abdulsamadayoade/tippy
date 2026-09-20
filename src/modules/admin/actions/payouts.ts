"use server";

import { db } from "@/lib/db";
import { reportError } from "@/lib/monitoring";
import { writeAudit } from "@/lib/audit";
import { createPendingPayout, submitPayout } from "@/lib/payouts";
import { computeAvailableBalance } from "@/lib/ledger";
import { MINIMUM_WITHDRAWAL } from "@/data/constants";
import { formatNaira } from "@/lib/utils";
import {
  auditFields,
  requireAdminWithLimit,
  revalidateCreatorAdminViews,
} from "./internal";

export async function payOutBelowMinimumAction(
  creatorId: string,
): Promise<{ error?: string; result?: string }> {
  const context = await requireAdminWithLimit();
  if ("error" in context) return { error: context.error };

  try {
    const balance = await computeAvailableBalance(db, creatorId);
    if (balance <= 0) return { error: "This creator has no balance to pay." };

    const created = await createPendingPayout(creatorId, balance, {
      allowBelowMinimum: true,
    });
    if ("error" in created) return { error: created.error };

    await writeAudit(db, {
      ...auditFields(context),
      action: "payout.manual",
      targetType: "creator",
      targetId: creatorId,
      details: {
        bankAmount: created.submission.amount,
        creatorFeeAmount: created.submission.creatorFeeAmount,
        balanceDebit: created.submission.balanceDebit,
        paymentReference: created.submission.paymentReference,
        belowMinimum: created.submission.balanceDebit < MINIMUM_WITHDRAWAL,
      },
    });

    const submitted = await submitPayout(created.submission);
    revalidateCreatorAdminViews(creatorId);

    return submitted.ok
      ? {
          result: `Sent ${formatNaira(created.submission.amount)} to the creator’s bank; creator transfer fee ${formatNaira(created.submission.creatorFeeAmount)}.`,
        }
      : { error: submitted.error ?? "The transfer didn't go through." };
  } catch (error) {
    reportError(error, {
      category: "admin.action",
      tags: { action: "payout.manual" },
      extra: { creatorId },
    });
    return { error: "Couldn’t send the payout. Try again." };
  }
}
