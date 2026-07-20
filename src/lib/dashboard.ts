import { and, desc, eq, isNotNull, lt, ne, or, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccount, payout, tip } from "@/lib/db/schema";
import { formatRelativeTime } from "@/lib/utils";
import type {
  BankAccount,
  Payout,
  TipCursor,
  TipFilter,
  TipStats,
  TipsPage,
} from "@/types";

const TIP_SHADES = ["strong", "default", "subtle"] as const;
const TIPS_PAGE_SIZE = 20;

function settledTipsFor(creatorId: string) {
  return and(eq(tip.creatorId, creatorId), eq(tip.status, "success"));
}

function tipFilterCondition(filter: TipFilter) {
  if (filter === "notes") return and(isNotNull(tip.note), ne(tip.note, ""));
  if (filter === "anonymous") return eq(tip.anonymous, true);
  return undefined;
}

export async function getTipsPage(
  creatorId: string,
  {
    filter = "all",
    cursor = null,
    shadeOffset = 0,
    limit = TIPS_PAGE_SIZE,
  }: {
    filter?: TipFilter;
    cursor?: TipCursor | null;
    shadeOffset?: number;
    limit?: number;
  } = {},
): Promise<TipsPage> {
  const cursorDate = cursor ? new Date(cursor.createdAt) : null;
  const validCursor =
    cursor && cursorDate && !Number.isNaN(cursorDate.getTime());

  const rows = await db.query.tip.findMany({
    where: and(
      settledTipsFor(creatorId),
      tipFilterCondition(filter),
      validCursor
        ? or(
            lt(tip.createdAt, cursorDate),
            and(eq(tip.createdAt, cursorDate), lt(tip.id, cursor.id)),
          )
        : undefined,
    ),
    orderBy: [desc(tip.createdAt), desc(tip.id)],
    limit: limit + 1,
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

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = pageRows.at(-1);

  return {
    tips: pageRows.map((row, index) => {
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
        shade: TIP_SHADES[(shadeOffset + index) % TIP_SHADES.length],
        time: formatRelativeTime(row.createdAt.toISOString()),
        createdAt: row.createdAt.toISOString(),
        reference: row.paymentReference,
      };
    }),
    nextCursor:
      hasMore && lastRow
        ? { createdAt: lastRow.createdAt.toISOString(), id: lastRow.id }
        : null,
  };
}

function periodStartSql(unit: "day" | "week" | "month" | "year") {
  return sql`(date_trunc(${sql.raw(`'${unit}'`)}, (now() at time zone 'utc') + interval '1 hour') - interval '1 hour')`;
}

function periodTotalSql(unit: "day" | "week" | "month" | "year") {
  return sql<number>`coalesce(sum(${tip.amount}) filter (where ${tip.createdAt} >= ${periodStartSql(unit)}), 0)`.mapWith(
    Number,
  );
}

function periodCountSql(unit: "day" | "week" | "month" | "year") {
  return sql<number>`count(*) filter (where ${tip.createdAt} >= ${periodStartSql(unit)})`.mapWith(
    Number,
  );
}

export async function getTipStats(creatorId: string): Promise<TipStats> {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${tip.amount}), 0)`.mapWith(Number),
      count: sql<number>`count(*)`.mapWith(Number),
      largest: sql<number>`coalesce(max(${tip.amount}), 0)`.mapWith(Number),
      supporters:
        sql<number>`count(distinct case when ${tip.anonymous} then ${tip.id}::text else lower(coalesce(nullif(trim(${tip.tipperName}), ''), 'someone')) end)`.mapWith(
          Number,
        ),
      dayTotal: periodTotalSql("day"),
      dayCount: periodCountSql("day"),
      weekTotal: periodTotalSql("week"),
      weekCount: periodCountSql("week"),
      monthTotal: periodTotalSql("month"),
      monthCount: periodCountSql("month"),
      yearTotal: periodTotalSql("year"),
      yearCount: periodCountSql("year"),
    })
    .from(tip)
    .where(settledTipsFor(creatorId));

  return {
    summary: {
      total: row.total,
      count: row.count,
      largest: row.largest,
      supporters: row.supporters,
      average: row.count ? Math.round(row.total / row.count) : 0,
    },
    periods: {
      day: { total: row.dayTotal, count: row.dayCount },
      week: { total: row.weekTotal, count: row.weekCount },
      month: { total: row.monthTotal, count: row.monthCount },
      year: { total: row.yearTotal, count: row.yearCount },
    },
  };
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
