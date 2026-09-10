"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { reportError } from "@/lib/monitoring";
import { writeAuditSafe } from "@/lib/audit";
import { reconcileTipWithMonnify } from "@/lib/tips";
import {
  reconcilePayoutWithMonnify,
  reconcileStalePayouts,
} from "@/lib/payouts";
import {
  getTransactionByPaymentReference,
  getTransferByReference,
  type MonnifyTransaction,
  type MonnifyTransfer,
} from "@/lib/monnify";
import { auditFields, requireAdminWithLimit } from "./internal";

export async function reconcileTipAction(
  paymentReference: string,
): Promise<{ error?: string; result?: string }> {
  const context = await requireAdminWithLimit();
  if ("error" in context) return { error: context.error };

  const reference = paymentReference.trim();
  if (!reference) return { error: "Missing reference." };

  let result: string;
  try {
    result = await reconcileTipWithMonnify(reference);
  } catch (error) {
    reportError(error, {
      category: "admin.action",
      tags: { action: "tip.reconcile" },
      extra: { paymentReference: reference },
    });
    return { error: "Reconcile failed — the provider may be unreachable." };
  }

  await writeAuditSafe(db, {
    ...auditFields(context),
    action: "tip.reconcile",
    targetType: "tip",
    targetId: reference,
    details: { result },
  });

  revalidatePath("/admin/lookup");
  return { result };
}

export async function reconcilePayoutAction(
  paymentReference: string,
): Promise<{ error?: string; result?: string }> {
  const context = await requireAdminWithLimit();
  if ("error" in context) return { error: context.error };

  const reference = paymentReference.trim();
  if (!reference) return { error: "Missing reference." };

  let result: string;
  try {
    result = await reconcilePayoutWithMonnify(reference);
  } catch (error) {
    reportError(error, {
      category: "admin.action",
      tags: { action: "payout.reconcile" },
      extra: { paymentReference: reference },
    });
    return { error: "Reconcile failed — the provider may be unreachable." };
  }

  await writeAuditSafe(db, {
    ...auditFields(context),
    action: "payout.reconcile",
    targetType: "payout",
    targetId: reference,
    details: { result },
  });

  revalidatePath("/admin/lookup");
  return { result };
}

export async function fetchProviderStateAction(
  paymentReference: string,
  kind: "tip" | "payout",
): Promise<
  | { error: string }
  | { transaction: MonnifyTransaction | null }
  | { transfer: MonnifyTransfer | null }
> {
  const context = await requireAdminWithLimit();
  if ("error" in context) return { error: context.error };

  const reference = paymentReference.trim();
  if (!reference) return { error: "Missing reference." };

  try {
    if (kind === "tip") {
      return { transaction: await getTransactionByPaymentReference(reference) };
    }
    return { transfer: await getTransferByReference(reference) };
  } catch (error) {
    reportError(error, {
      category: "admin.action",
      tags: { action: "provider.fetch", kind },
      extra: { paymentReference: reference },
    });
    return { error: "Couldn’t reach the payment provider." };
  }
}

export async function reconcileCreatorPayoutsAction(
  creatorId: string,
): Promise<{ error?: string }> {
  const context = await requireAdminWithLimit();
  if ("error" in context) return { error: context.error };

  try {
    await reconcileStalePayouts(creatorId);
  } catch (error) {
    reportError(error, {
      category: "admin.action",
      tags: { action: "payout.reconcile_stale" },
      extra: { creatorId },
    });
    return { error: "Reconcile failed — the provider may be unreachable." };
  }

  await writeAuditSafe(db, {
    ...auditFields(context),
    action: "payout.reconcile_stale",
    targetType: "creator",
    targetId: creatorId,
  });

  revalidatePath(`/admin/creators/${creatorId}`);
  return {};
}
