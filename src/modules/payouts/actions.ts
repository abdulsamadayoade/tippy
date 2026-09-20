"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccount, creator, payout } from "@/lib/db/schema";
import { validateBankAccount } from "@/lib/monnify";
import { reportError } from "@/lib/monitoring";
import { createPendingPayout, submitPayout } from "@/lib/payouts";
import { getSessionCreator } from "@/lib/session";
import { writeAuditSafe } from "@/lib/audit";
import { verifyCreatorBank } from "@/lib/bank-verification";
import {
  accountSchema,
  withdrawalQuoteSchema,
  verificationSchema,
} from "./schema";
import { BANKS } from "@/data/constants";
import type { FormErrors } from "./types";
import type { WithdrawalQuote } from "@/lib/payout-fees";

function revalidatePayoutViews() {
  revalidatePath("/payouts");
  revalidatePath("/overview");
}

async function savePayoutAccount(values: {
  bank: string;
  accountNumber: string;
}): Promise<{ errors?: FormErrors }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { errors: { bank: "Sign in and try again." } };

  const parsed = accountSchema.safeParse(values);

  if (!parsed.success) {
    const errors: FormErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "bank" || field === "accountNumber") {
        errors[field] ??= issue.message;
      }
    }
    return { errors };
  }

  const bankCode = BANKS.find(({ name }) => name === parsed.data.bank)!.code;

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

  if (
    !resolved ||
    resolved.accountNumber !== parsed.data.accountNumber ||
    resolved.bankCode !== bankCode
  ) {
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

  const previous = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select ${creator.id} from ${creator} where ${creator.id} = ${sessionCreator.id} for update`,
    );
    const previous = await tx.query.bankAccount.findFirst({
      where: eq(bankAccount.creatorId, sessionCreator.id),
    });

    const changed =
      !previous ||
      previous.bankCode !== bankCode ||
      previous.accountNumber !== accountValues.accountNumber;
    await tx
      .insert(bankAccount)
      .values({ creatorId: sessionCreator.id, ...accountValues })
      .onConflictDoUpdate({
        target: bankAccount.creatorId,
        set: {
          ...accountValues,
          ...(changed
            ? {
                revision: (previous?.revision ?? 0) + 1,
                verificationStatus: "unverified" as const,
                verificationEnvironment: null,
                verificationRevision: null,
                verifiedAt: null,
                verificationReference: null,
                verificationAttemptId: null,
                verificationConsentAt: null,
              }
            : {}),
        },
      });
    return previous;
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

async function removePayoutAccount(): Promise<{ error?: string }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { error: "Sign in and try again." };

  const removed = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select ${creator.id} from ${creator} where ${creator.id} = ${sessionCreator.id} for update`,
    );

    const existingPayout = await tx.query.payout.findFirst({
      where: eq(payout.creatorId, sessionCreator.id),
      columns: { id: true },
    });

    if (existingPayout) return null;

    return tx
      .delete(bankAccount)
      .where(eq(bankAccount.creatorId, sessionCreator.id))
      .returning({ bankName: bankAccount.bankName });
  });

  if (!removed)
    return {
      error:
        "This account has payout history. Edit your bank details to replace it instead.",
    };

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

async function setAutoPayout(enabled: boolean): Promise<{ error?: string }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { error: "Sign in and try again." };

  await db
    .update(creator)
    .set({ autoPayout: enabled })
    .where(eq(creator.id, sessionCreator.id));

  revalidatePayoutViews();
  return {};
}

async function requestWithdrawal(
  expectedQuote: WithdrawalQuote,
): Promise<{ error?: string }> {
  const { creator: sessionCreator } = await getSessionCreator();

  if (!sessionCreator) return { error: "Sign in and try again." };

  const parsed = withdrawalQuoteSchema.safeParse(expectedQuote);

  if (!parsed.success)
    return {
      error: "We couldn’t start this withdrawal. Refresh and try again.",
    };

  const created = await createPendingPayout(
    sessionCreator.id,
    parsed.data.balanceDebit,
    { expectedQuote: parsed.data },
  );

  revalidatePayoutViews();

  if ("error" in created) return { error: created.error };
  const submitted = await submitPayout(created.submission);
  revalidatePayoutViews();

  if (!submitted.ok)
    return { error: submitted.error ?? "We couldn’t start this withdrawal." };
  return {};
}

async function verifyPayoutIdentity(values: {
  bvn: string;
  consent: boolean;
}): Promise<{ error?: string; verified?: boolean }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { error: "Sign in and try again." };

  const parsed = verificationSchema.safeParse(values);

  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const result = await verifyCreatorBank(
    sessionCreator.id,
    sessionCreator.userId,
    parsed.data.bvn,
    parsed.data.consent,
  );

  revalidatePayoutViews();
  return result;
}

export {
  savePayoutAccount,
  removePayoutAccount,
  setAutoPayout,
  requestWithdrawal,
  verifyPayoutIdentity,
};
