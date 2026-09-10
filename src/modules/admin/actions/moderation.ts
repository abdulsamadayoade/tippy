"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportError } from "@/lib/monitoring";
import { creator } from "@/lib/db/schema";
import { writeAudit } from "@/lib/audit";
import { moderationSchema } from "../schema";
import {
  auditFields,
  requireAdminWithLimit,
  revalidateCreatorAdminViews,
} from "./internal";

async function setModerationState(
  values: { creatorId: string; reason: string },
  action:
    | "creator.suspend"
    | "creator.unsuspend"
    | "creator.freeze_payouts"
    | "creator.unfreeze_payouts",
): Promise<{ error?: string }> {
  const context = await requireAdminWithLimit();
  if ("error" in context) return { error: context.error };

  const parsed = moderationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { creatorId, reason } = parsed.data;
  const adminUserId = context.session.user.id;

  const update =
    action === "creator.suspend"
      ? { suspended: true }
      : action === "creator.unsuspend"
        ? { suspended: false }
        : action === "creator.freeze_payouts"
          ? {
              payoutsFrozen: true,
              frozenReason: reason,
              frozenAt: new Date(),
              frozenByUserId: adminUserId,
            }
          : {
              payoutsFrozen: false,
              frozenReason: null,
              frozenAt: null,
              frozenByUserId: null,
            };

  try {
    const changed = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(creator)
        .set(update)
        .where(eq(creator.id, creatorId))
        .returning({ id: creator.id, username: creator.username });

      if (!row) return false;

      await writeAudit(tx, {
        ...auditFields(context),
        action,
        targetType: "creator",
        targetId: creatorId,
        details: { username: row.username, reason },
      });
      return true;
    });

    if (!changed) return { error: "Creator not found." };
  } catch (error) {
    reportError(error, {
      category: "admin.action",
      tags: { action },
      extra: { creatorId },
    });
    return { error: "Couldn’t update the creator. Try again." };
  }

  revalidateCreatorAdminViews(creatorId);
  return {};
}

export async function suspendCreator(values: {
  creatorId: string;
  reason: string;
}): Promise<{ error?: string }> {
  return setModerationState(values, "creator.suspend");
}

export async function unsuspendCreator(values: {
  creatorId: string;
  reason: string;
}): Promise<{ error?: string }> {
  return setModerationState(values, "creator.unsuspend");
}

export async function freezeCreatorPayouts(values: {
  creatorId: string;
  reason: string;
}): Promise<{ error?: string }> {
  return setModerationState(values, "creator.freeze_payouts");
}

export async function unfreezeCreatorPayouts(values: {
  creatorId: string;
  reason: string;
}): Promise<{ error?: string }> {
  return setModerationState(values, "creator.unfreeze_payouts");
}
