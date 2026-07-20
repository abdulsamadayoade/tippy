import { and, desc, eq, ne, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccount, payout, tip } from "@/lib/db/schema";
import { formatRelativeTime } from "@/lib/utils";
import type { BankAccount, Payout, Tip } from "@/store/types";

const TIP_SHADES = ["strong", "default", "subtle"] as const;

export async function getCreatorTips(creatorId: string): Promise<Tip[]> {
  const rows = await db.query.tip.findMany({
    where: and(eq(tip.creatorId, creatorId), eq(tip.status, "success")),
    orderBy: desc(tip.createdAt),
    columns: {
      id: true,
      amount: true,
      note: true,
      anonymous: true,
      tipperName: true,
      paymentReference: true,
      createdAt: true,
    },
  });

  return rows.map((row, index) => {
    const name = row.anonymous
      ? "Anonymous"
      : row.tipperName?.trim() || "Someone";

    return {
      id: row.id,
      name,
      amount: row.amount,
      note: row.note ?? "",
      anonymous: row.anonymous,
      initial: row.anonymous ? "?" : name.charAt(0).toUpperCase(),
      shade: TIP_SHADES[index % TIP_SHADES.length],
      time: formatRelativeTime(row.createdAt.toISOString()),
      createdAt: row.createdAt.toISOString(),
      reference: row.paymentReference,
    };
  });
}

export async function getPayoutData(creatorId: string): Promise<{
  balance: number;
  account: BankAccount | null;
  payouts: Payout[];
}> {
  const [tipTotals, payoutTotals, accountRow, payoutRows] = await Promise.all([
    db
      .select({ total: sum(tip.amount) })
      .from(tip)
      .where(and(eq(tip.creatorId, creatorId), eq(tip.status, "success"))),
    db
      .select({ total: sum(payout.amount) })
      .from(payout)
      .where(and(eq(payout.creatorId, creatorId), ne(payout.status, "failed"))),
    db.query.bankAccount.findFirst({
      where: eq(bankAccount.creatorId, creatorId),
      columns: { bankName: true, accountName: true, accountNumber: true },
    }),
    db.query.payout.findMany({
      where: eq(payout.creatorId, creatorId),
      orderBy: desc(payout.createdAt),
      columns: {
        id: true,
        amount: true,
        status: true,
        paymentReference: true,
        createdAt: true,
      },
    }),
  ]);

  const tipTotal = Number(tipTotals[0]?.total ?? 0);
  const payoutTotal = Number(payoutTotals[0]?.total ?? 0);

  return {
    balance: Math.max(tipTotal - payoutTotal, 0),
    account: accountRow
      ? {
          bank: accountRow.bankName,
          accountName: accountRow.accountName,
          accountNumber: accountRow.accountNumber,
        }
      : null,
    payouts: payoutRows.map((row) => ({
      id: row.id,
      date: row.createdAt.toISOString().slice(0, 10),
      amount: row.amount,
      status: row.status,
      reference: row.paymentReference,
    })),
  };
}
