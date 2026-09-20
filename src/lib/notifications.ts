import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccount, creator, payout, tip } from "@/lib/db/schema";
import { user } from "@/lib/db/auth-schema";
import {
  sendPayoutPaidEmail,
  sendTipReceiptEmail,
  sendTipReceivedEmail,
} from "@/lib/email";
import { reportError } from "@/lib/monitoring";

async function notifyTipSettled(paymentReference: string): Promise<void> {
  try {
    const [row] = await db
      .select({
        amount: tip.amount,
        note: tip.note,
        anonymous: tip.anonymous,
        tipperName: tip.tipperName,
        tipperEmail: tip.tipperEmail,
        creatorDisplayName: creator.displayName,
        creatorUsername: creator.username,
        creatorEmail: user.email,
      })
      .from(tip)
      .innerJoin(creator, eq(tip.creatorId, creator.id))
      .innerJoin(user, eq(creator.userId, user.id))
      .where(eq(tip.paymentReference, paymentReference))
      .limit(1);

    if (!row) return;

    const tipperDisplayName =
      (!row.anonymous && row.tipperName?.trim()) || "Anonymous";

    try {
      await sendTipReceivedEmail({
        to: row.creatorEmail,
        tipperDisplayName,
        amount: row.amount,
        note: row.note,
        paymentReference,
      });
    } catch (error) {
      reportError(error, {
        category: "tip.notification",
        tags: { kind: "tip-received" },
        extra: { paymentReference },
      });
    }

    if (row.tipperEmail) {
      try {
        await sendTipReceiptEmail({
          to: row.tipperEmail,
          creatorDisplayName: row.creatorDisplayName,
          creatorUsername: row.creatorUsername,
          amount: row.amount,
          note: row.note,
          paymentReference,
        });
      } catch (error) {
        reportError(error, {
          category: "tip.notification",
          tags: { kind: "tip-receipt" },
          extra: { paymentReference },
        });
      }
    }
  } catch (error) {
    reportError(error, {
      category: "tip.notification",
      tags: { kind: "load" },
      extra: { paymentReference },
    });
  }
}

async function notifyPayoutPaid(paymentReference: string): Promise<void> {
  try {
    const [row] = await db
      .select({
        amount: payout.amount,
        creatorFeeAmount: payout.creatorFeeAmount,
        creatorEmail: user.email,
        bankName: sql<string>`coalesce(${payout.destinationBankName}, ${bankAccount.bankName})`,
        accountNumber: sql<string>`coalesce(${payout.destinationLast4}, right(${bankAccount.accountNumber}, 4))`,
      })
      .from(payout)
      .innerJoin(creator, eq(payout.creatorId, creator.id))
      .innerJoin(user, eq(creator.userId, user.id))
      .innerJoin(bankAccount, eq(payout.bankAccountId, bankAccount.id))
      .where(eq(payout.paymentReference, paymentReference))
      .limit(1);

    if (!row) return;

    try {
      await sendPayoutPaidEmail({
        to: row.creatorEmail,
        amount: row.amount,
        creatorFeeAmount: row.creatorFeeAmount,
        bankName: row.bankName,
        accountNumber: row.accountNumber,
        paymentReference,
      });
    } catch (error) {
      reportError(error, {
        category: "payout.notification",
        tags: { kind: "payout-paid" },
        extra: { paymentReference },
      });
    }
  } catch (error) {
    reportError(error, {
      category: "payout.notification",
      tags: { kind: "load" },
      extra: { paymentReference },
    });
  }
}

export { notifyTipSettled, notifyPayoutPaid };
