"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccount, creator } from "@/lib/db/schema";
import { validateBankAccount } from "@/lib/monnify";
import { reportError } from "@/lib/monitoring";
import { createPendingPayout, submitPayout } from "@/lib/payouts";
import { getSessionCreator } from "@/lib/session";
import { writeAuditSafe } from "@/lib/audit";
import { accountSchema } from "./schema";
import { BANKS } from "@/data/constants";
import type { FormErrors } from "./types";

function revalidatePayoutViews() {
  revalidatePath("/payouts");
  revalidatePath("/overview");
}

export async function savePayoutAccount(values: {
  bank: string;
  accountNumber: string;
  accountName: string;
}): Promise<{ errors?: FormErrors }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { errors: { bank: "Sign in and try again." } };

  const parsed = accountSchema.safeParse(values);

  if (!parsed.success) {
    const errors: FormErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        field === "bank" ||
        field === "accountNumber" ||
        field === "accountName"
      ) {
        errors[field] ??= issue.message;
      }
    }
    return { errors };
  }

  const bankCode = BANKS.find(({ name }) => name === parsed.data.bank)!.code;

  // Name enquiry via Monnify — the resolved name is what payouts are sent to,
  // so the "Verified" badge in the UI is backed by the bank's own record.
  let resolved;
  try {
    resolved = await validateBankAccount(parsed.data.accountNumber, bankCode);
  } catch (error) {
    reportError(error, {
      category: "bank.verification",
      tags: { bankCode },
      extra: { creatorId: sessionCreator.id },
    });
    return {
      errors: {
        accountNumber:
          "We couldn’t verify your account right now. Try again in a moment.",
      },
    };
  }

  if (!resolved) {
    return {
      errors: {
        accountNumber: `We couldn’t find that account at ${parsed.data.bank}. Check the number and bank.`,
      },
    };
  }

  const accountValues = {
    bankName: parsed.data.bank,
    bankCode,
    accountName: resolved.accountName,
    accountNumber: parsed.data.accountNumber,
  };

  const previous = await db.query.bankAccount.findFirst({
    where: eq(bankAccount.creatorId, sessionCreator.id),
    columns: { bankName: true, accountNumber: true },
  });

  await db
    .insert(bankAccount)
    .values({ creatorId: sessionCreator.id, ...accountValues })
    .onConflictDoUpdate({
      target: bankAccount.creatorId,
      set: accountValues,
    });

  // Best-effort trail for fraud review — account numbers masked to last-4.
  await writeAuditSafe(db, {
    actorType: "creator",
    actorUserId: sessionCreator.userId,
    action: "bank_account.update",
    targetType: "creator",
    targetId: sessionCreator.id,
    details: {
      before: previous
        ? {
            bankName: previous.bankName,
            accountNumberLast4: previous.accountNumber.slice(-4),
          }
        : null,
      after: {
        bankName: accountValues.bankName,
        accountNumberLast4: accountValues.accountNumber.slice(-4),
      },
    },
  });

  revalidatePayoutViews();
  return {};
}

export async function removePayoutAccount(): Promise<{ error?: string }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { error: "Sign in and try again." };

  const removed = await db
    .delete(bankAccount)
    .where(eq(bankAccount.creatorId, sessionCreator.id))
    .returning({ bankName: bankAccount.bankName });

  if (removed.length > 0) {
    await writeAuditSafe(db, {
      actorType: "creator",
      actorUserId: sessionCreator.userId,
      action: "bank_account.remove",
      targetType: "creator",
      targetId: sessionCreator.id,
      details: { bankName: removed[0].bankName },
    });
  }

  revalidatePayoutViews();
  return {};
}

export async function setAutoPayout(
  enabled: boolean,
): Promise<{ error?: string }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { error: "Sign in and try again." };

  await db
    .update(creator)
    .set({ autoPayout: enabled })
    .where(eq(creator.id, sessionCreator.id));

  revalidatePayoutViews();
  return {};
}

export async function requestWithdrawal(amount: number): Promise<{
  error?: string;
  withdrawal?: { bankAmount: number; providerFeeAmount: number };
}> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { error: "Sign in and try again." };
  if (sessionCreator.suspended) {
    return { error: "Your account is suspended. Contact hello@tippy.cash." };
  }
  if (sessionCreator.payoutsFrozen) {
    return {
      error:
        "Withdrawals are temporarily paused on your account while we review recent activity. Contact hello@tippy.cash.",
    };
  }

  const created = await createPendingPayout(sessionCreator.id, amount);
  if ("error" in created) return { error: created.error };

  // The reserved row is visible immediately; the transfer outcome updates it.
  revalidatePayoutViews();
  const submitted = await submitPayout(created.submission);
  revalidatePayoutViews();

  if (!submitted.ok) {
    return {
      error:
        submitted.error ??
        "We couldn’t start this withdrawal. Try again shortly.",
    };
  }

  return {
    withdrawal: {
      bankAmount: created.submission.amount,
      providerFeeAmount:
        submitted.providerFeeAmount ?? created.submission.providerFeeAmount,
    },
  };
}
