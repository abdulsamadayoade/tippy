import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccount, creator } from "@/lib/db/schema";
import { verifyBvnAccount } from "@/lib/monnify";
import { getPayoutEnvironment } from "@/lib/payout-config";
import { isAccountVerified } from "@/lib/identity-verification";
import { consumeRateLimit } from "@/lib/rate-limit";
import { writeAudit, writeAuditSafe } from "@/lib/audit";
import { reportWarning } from "@/lib/monitoring";

export async function verifyCreatorBank(
  creatorId: string,
  userId: string,
  bvn: string,
  consent: boolean,
): Promise<{ error?: string; verified?: boolean }> {
  if (consent !== true) return { error: "Please consent to BVN verification." };
  if (typeof bvn !== "string" || !/^\d{11}$/.test(bvn))
    return { error: "Enter your 11-digit BVN." };

  const limit = await consumeRateLimit(`bvn-verification:${creatorId}`, {
    window: 900,
    max: 5,
  });

  if (!limit.allowed)
    return {
      error: "Too many verification attempts. Please try again in 15 minutes.",
    };

  const environment = getPayoutEnvironment();
  const attemptId = crypto.randomUUID();

  const account = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select ${creator.id} from ${creator} where ${creator.id} = ${creatorId} for update`,
    );
    const row = await tx.query.bankAccount.findFirst({
      where: eq(bankAccount.creatorId, creatorId),
    });
    if (!row || isAccountVerified(row, environment)) return row;
    await tx
      .update(bankAccount)
      .set({
        verificationAttemptId: attemptId,
        verificationConsentAt: new Date(),
      })
      .where(eq(bankAccount.id, row.id));
    return row;
  });

  if (!account)
    return { error: "Add a bank account before verifying your identity." };

  if (isAccountVerified(account, environment)) return { verified: true };
  const result = await verifyBvnAccount({
    bvn,
    bankCode: account.bankCode,
    accountNumber: account.accountNumber,
  });

  if (result.status === "unavailable") {
    reportWarning("Identity verification service unavailable", {
      category: "identity.verification",
      extra: { creatorId },
      tags: { environment },
    });
    await writeAuditSafe(db, {
      actorType: "creator",
      actorUserId: userId,
      action: "identity.verification",
      targetType: "creator",
      targetId: creatorId,
      details: {
        status: "unavailable",
        environment,
        bankAccountId: account.id,
        revision: account.revision,
      },
    });
    return {
      error:
        "We couldn’t reach the verification service. Please try again shortly.",
    };
  }
  const applied = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select ${creator.id} from ${creator} where ${creator.id} = ${creatorId} for update`,
    );
    const current = await tx.query.bankAccount.findFirst({
      where: eq(bankAccount.creatorId, creatorId),
    });
    if (
      !current ||
      current.id !== account.id ||
      current.revision !== account.revision ||
      current.verificationAttemptId !== attemptId
    )
      return false;
    await tx
      .update(bankAccount)
      .set({
        verificationStatus:
          result.status === "verified" ? "verified" : "failed",
        verificationEnvironment: environment,
        verificationRevision: account.revision,
        verifiedAt: result.status === "verified" ? new Date() : null,
        verificationReference: result.providerReference,
        verificationAttemptId: null,
      })
      .where(eq(bankAccount.id, account.id));
    await writeAudit(tx, {
      actorType: "creator",
      actorUserId: userId,
      action: "identity.verification",
      targetType: "creator",
      targetId: creatorId,
      details: {
        status: result.status,
        environment,
        bankAccountId: account.id,
        revision: account.revision,
      },
    });
    return true;
  });
  if (!applied)
    return {
      error:
        "Your account or verification attempt changed. Please verify the current bank account again.",
    };
  return result.status === "verified"
    ? { verified: true }
    : {
        error:
          "Your BVN did not fully match this bank account. Check your details and try again.",
      };
}
