import {
  and,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  lt,
  or,
  sum,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  abuseReport,
  adjustment,
  auditLog,
  bankAccount,
  creator,
  payout,
  tip,
  webhookEvent,
} from "@/lib/db/schema";
import { user } from "@/lib/db/auth-schema";
import { checkAdminAccess } from "@/lib/admin-session";
import { computeAvailableBalance } from "@/lib/ledger";

type CreatorSummary = {
  id: string;
  username: string;
  displayName: string;
};

export type DashboardCounts = {
  openPayouts: number;
  stalePendingTips: number;
  webhookErrors24h: number;
  suspendedCreators: number;
};

export type CreatorListFilter = "all" | "suspended" | "frozen";

const TIP_STALE_MS = 10 * 60_000;
const TIP_EXPIRE_MS = 24 * 60 * 60_000;
const CREATOR_TIP_PAGE_SIZE = 25;
const AUDIT_PAGE_SIZE = 50;

async function assertAdmin(): Promise<void> {
  const gate = await checkAdminAccess();
  if (gate.status !== "ok") throw new Error("Not authorized");
}

export type ReferenceLookup = {
  tip: (typeof tip.$inferSelect & { creator: CreatorSummary | null }) | null;
  payout:
    | (typeof payout.$inferSelect & { creator: CreatorSummary | null })
    | null;
  events: Array<typeof webhookEvent.$inferSelect>;
};

async function creatorSummary(
  creatorId: string,
): Promise<CreatorSummary | null> {
  const row = await db.query.creator.findFirst({
    where: eq(creator.id, creatorId),
    columns: { id: true, username: true, displayName: true },
  });
  return row ?? null;
}

export async function lookupReference(
  reference: string,
): Promise<ReferenceLookup> {
  await assertAdmin();

  const [tipRow, payoutRow, events] = await Promise.all([
    db.query.tip.findFirst({
      where: or(
        eq(tip.paymentReference, reference),
        eq(tip.providerReference, reference),
      ),
    }),
    db.query.payout.findFirst({
      where: or(
        eq(payout.paymentReference, reference),
        eq(payout.providerReference, reference),
      ),
    }),
    db.query.webhookEvent.findMany({
      where: eq(webhookEvent.reference, reference),
      orderBy: [desc(webhookEvent.receivedAt)],
      limit: 20,
    }),
  ]);

  return {
    tip: tipRow
      ? { ...tipRow, creator: await creatorSummary(tipRow.creatorId) }
      : null,
    payout: payoutRow
      ? { ...payoutRow, creator: await creatorSummary(payoutRow.creatorId) }
      : null,
    events,
  };
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  await assertAdmin();
  const now = Date.now();

  const [[openPayouts], [staleTips], [webhookErrors], [suspended]] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(payout)
        .where(inArray(payout.status, ["pending", "processing"])),
      db
        .select({ value: count() })
        .from(tip)
        .where(
          and(
            eq(tip.status, "pending"),
            lt(tip.createdAt, new Date(now - TIP_STALE_MS)),
            gt(tip.createdAt, new Date(now - TIP_EXPIRE_MS)),
          ),
        ),
      db
        .select({ value: count() })
        .from(webhookEvent)
        .where(
          and(
            inArray(webhookEvent.processingOutcome, ["error", "invalid"]),
            gt(webhookEvent.receivedAt, new Date(now - 24 * 60 * 60_000)),
          ),
        ),
      db
        .select({ value: count() })
        .from(creator)
        .where(eq(creator.suspended, true)),
    ]);

  return {
    openPayouts: openPayouts?.value ?? 0,
    stalePendingTips: staleTips?.value ?? 0,
    webhookErrors24h: webhookErrors?.value ?? 0,
    suspendedCreators: suspended?.value ?? 0,
  };
}

export async function listCreators({
  search,
  filter,
}: {
  search?: string;
  filter?: CreatorListFilter;
}) {
  await assertAdmin();

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(creator.username, `%${search}%`),
        ilike(creator.displayName, `%${search}%`),
      ),
    );
  }
  if (filter === "suspended") conditions.push(eq(creator.suspended, true));
  if (filter === "frozen") conditions.push(eq(creator.payoutsFrozen, true));

  return db.query.creator.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    columns: {
      id: true,
      username: true,
      displayName: true,
      suspended: true,
      payoutsFrozen: true,
      createdAt: true,
    },
    orderBy: [desc(creator.createdAt)],
    limit: 100,
  });
}

export async function getCreatorDetail(creatorId: string, tipPage = 1) {
  await assertAdmin();

  const creatorRow = await db.query.creator.findFirst({
    where: eq(creator.id, creatorId),
  });
  if (!creatorRow) return null;

  const [
    userRow,
    balance,
    [tipTotals],
    tipRows,
    [allTipTotals],
    account,
    payouts,
    adjustments,
    reports,
    accountAudit,
  ] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, creatorRow.userId),
      columns: { email: true },
    }),
    computeAvailableBalance(db, creatorId),
    db
      .select({
        total: sum(tip.amount),
        count: count(),
      })
      .from(tip)
      .where(and(eq(tip.creatorId, creatorId), eq(tip.status, "success"))),
    db.query.tip.findMany({
      where: eq(tip.creatorId, creatorId),
      columns: {
        id: true,
        amount: true,
        amountPaid: true,
        providerSettlementAmount: true,
        note: true,
        anonymous: true,
        tipperName: true,
        tipperEmail: true,
        paymentReference: true,
        providerReference: true,
        status: true,
        createdAt: true,
      },
      orderBy: [desc(tip.createdAt)],
      limit: CREATOR_TIP_PAGE_SIZE,
      offset: Math.max(0, tipPage - 1) * CREATOR_TIP_PAGE_SIZE,
    }),
    db.select({ value: count() }).from(tip).where(eq(tip.creatorId, creatorId)),
    db.query.bankAccount.findFirst({
      where: eq(bankAccount.creatorId, creatorId),
      columns: {
        bankName: true,
        accountName: true,
        accountNumber: true,
        updatedAt: true,
      },
    }),
    db.query.payout.findMany({
      where: eq(payout.creatorId, creatorId),
      orderBy: [desc(payout.createdAt)],
      limit: 25,
    }),
    db.query.adjustment.findMany({
      where: eq(adjustment.creatorId, creatorId),
      orderBy: [desc(adjustment.createdAt)],
      limit: 25,
    }),
    db.query.abuseReport.findMany({
      where: eq(abuseReport.creatorId, creatorId),
      orderBy: [desc(abuseReport.createdAt)],
      limit: 25,
    }),
    // Bank-account and moderation history for this creator from the trail.
    db.query.auditLog.findMany({
      where: and(
        eq(auditLog.targetType, "creator"),
        eq(auditLog.targetId, creatorId),
      ),
      orderBy: [desc(auditLog.createdAt)],
      limit: 25,
    }),
  ]);

  return {
    creator: creatorRow,
    email: userRow?.email ?? null,
    balance,
    tipTotal: Number(tipTotals?.total ?? 0),
    tipCount: tipTotals?.count ?? 0,
    tips: tipRows,
    totalTips: allTipTotals?.value ?? 0,
    tipPageSize: CREATOR_TIP_PAGE_SIZE,
    bankAccount: account
      ? {
          bankName: account.bankName,
          accountName: account.accountName,
          accountNumberLast4: account.accountNumber.slice(-4),
          updatedAt: account.updatedAt,
        }
      : null,
    payouts,
    adjustments,
    reports,
    auditEntries: accountAudit,
  };
}

export async function listAdjustments() {
  await assertAdmin();

  const rows = await db
    .select({
      id: adjustment.id,
      type: adjustment.type,
      amount: adjustment.amount,
      reason: adjustment.reason,
      createdAt: adjustment.createdAt,
      creatorId: adjustment.creatorId,
      username: creator.username,
      createdBy: user.email,
    })
    .from(adjustment)
    .innerJoin(creator, eq(adjustment.creatorId, creator.id))
    .innerJoin(user, eq(adjustment.createdByUserId, user.id))
    .orderBy(desc(adjustment.createdAt))
    .limit(100);

  return rows;
}

export async function listCreatorOptions() {
  await assertAdmin();

  return db.query.creator.findMany({
    columns: { id: true, username: true, displayName: true },
    orderBy: [desc(creator.createdAt)],
    limit: 500,
  });
}

export type AuditLogFilters = {
  actorType?: "admin" | "creator" | "system";
  action?: string;
  from?: Date;
  to?: Date;
};

export function auditLogConditions(filters: AuditLogFilters) {
  const conditions = [];
  if (filters.actorType) {
    conditions.push(eq(auditLog.actorType, filters.actorType));
  }
  if (filters.action) {
    conditions.push(ilike(auditLog.action, `%${filters.action}%`));
  }
  if (filters.from) conditions.push(gt(auditLog.createdAt, filters.from));
  if (filters.to) conditions.push(lt(auditLog.createdAt, filters.to));
  return conditions;
}

export async function listAuditLog(filters: AuditLogFilters, page: number) {
  await assertAdmin();

  const conditions = auditLogConditions(filters);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [entries, [total]] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        actorType: auditLog.actorType,
        actorEmail: user.email,
        action: auditLog.action,
        targetType: auditLog.targetType,
        targetId: auditLog.targetId,
        details: auditLog.details,
        ip: auditLog.ip,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .leftJoin(user, eq(auditLog.actorUserId, user.id))
      .where(where)
      .orderBy(desc(auditLog.id))
      .limit(AUDIT_PAGE_SIZE)
      .offset(Math.max(0, page - 1) * AUDIT_PAGE_SIZE),
    db.select({ value: count() }).from(auditLog).where(where),
  ]);

  return {
    entries,
    total: total?.value ?? 0,
    pageSize: AUDIT_PAGE_SIZE,
  };
}

export async function listAbuseReports() {
  await assertAdmin();

  return db
    .select({
      id: abuseReport.id,
      reason: abuseReport.reason,
      details: abuseReport.details,
      reporterEmail: abuseReport.reporterEmail,
      createdAt: abuseReport.createdAt,
      creatorId: creator.id,
      username: creator.username,
      displayName: creator.displayName,
      creatorSuspended: creator.suspended,
    })
    .from(abuseReport)
    .innerJoin(creator, eq(abuseReport.creatorId, creator.id))
    .orderBy(desc(abuseReport.createdAt))
    .limit(100);
}
