import { and, count, eq, gt, gte, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLog, bankAccount, creator, payout, tip } from "@/lib/db/schema";
import { writeAudit } from "@/lib/audit";
import { reportError, reportWarning } from "@/lib/monitoring";

const HOUR_MS = 60 * 60_000;
const DAY_MS = 24 * HOUR_MS;

export const RISK_THRESHOLDS = {
  largeTip: 250_000,
  weeklyInflow: 1_000_000,
  newAccountDays: 30,
  newAccountInflow: 500_000,
  repeatedTipAmount: 50_000,
  repeatedTipCount: 5,
  rapidWithdrawalCount: 4,
  bankChangeWindowHours: 72,
  bankChangePayout: 50_000,
  verificationFailures: 3,
} as const;

export const RISK_FLAG_ACTION = "risk.flag";

export type RiskRule =
  | "large_tip"
  | "weekly_inflow"
  | "new_account_inflow"
  | "repeated_tip_amount"
  | "rapid_withdrawals"
  | "bank_change_before_payout"
  | "verification_failures"
  | "shared_payout_account"
  | "shared_account_name";

type Candidate = {
  rule: RiskRule;
  creatorId: string;
  key: string;
  rearmAfterMs?: number;
  evidence: Record<string, unknown>;
};

export type RiskSummary = {
  candidates: number;
  flagged: number;
  errors: number;
};

const since = (now: number, ms: number) => new Date(now - ms);

async function largeTips(now: number): Promise<Candidate[]> {
  const rows = await db
    .select({
      id: tip.id,
      creatorId: tip.creatorId,
      amount: tip.amount,
      paymentReference: tip.paymentReference,
    })
    .from(tip)
    .where(
      and(
        eq(tip.status, "success"),
        gte(tip.amount, RISK_THRESHOLDS.largeTip),
        gt(tip.createdAt, since(now, 7 * DAY_MS)),
      ),
    );

  return rows.map(({ id, creatorId, ...evidence }) => ({
    rule: "large_tip",
    creatorId,
    key: `large_tip:${id}`,
    evidence,
  }));
}

async function weeklyInflow(now: number): Promise<Candidate[]> {
  const total = sql<number>`sum(${tip.amount})`.mapWith(Number);
  const rows = await db
    .select({ creatorId: tip.creatorId, total, tips: count() })
    .from(tip)
    .where(
      and(eq(tip.status, "success"), gt(tip.createdAt, since(now, 7 * DAY_MS))),
    )
    .groupBy(tip.creatorId)
    .having(sql`sum(${tip.amount}) > ${RISK_THRESHOLDS.weeklyInflow}`);

  return rows.map(({ creatorId, ...evidence }) => ({
    rule: "weekly_inflow",
    creatorId,
    key: "weekly_inflow",
    rearmAfterMs: 7 * DAY_MS,
    evidence: { ...evidence, windowDays: 7 },
  }));
}

async function newAccountInflow(now: number): Promise<Candidate[]> {
  const total = sql<number>`sum(${tip.amount})`.mapWith(Number);
  const rows = await db
    .select({ creatorId: tip.creatorId, total, tips: count() })
    .from(tip)
    .innerJoin(creator, eq(creator.id, tip.creatorId))
    .where(
      and(
        eq(tip.status, "success"),
        gt(
          creator.createdAt,
          since(now, RISK_THRESHOLDS.newAccountDays * DAY_MS),
        ),
      ),
    )
    .groupBy(tip.creatorId)
    .having(sql`sum(${tip.amount}) > ${RISK_THRESHOLDS.newAccountInflow}`);

  return rows.map(({ creatorId, ...evidence }) => ({
    rule: "new_account_inflow",
    creatorId,
    key: "new_account_inflow",
    evidence,
  }));
}

async function repeatedTipAmounts(now: number): Promise<Candidate[]> {
  const rows = await db
    .select({ creatorId: tip.creatorId, amount: tip.amount, tips: count() })
    .from(tip)
    .where(
      and(
        eq(tip.status, "success"),
        gte(tip.amount, RISK_THRESHOLDS.repeatedTipAmount),
        gt(tip.createdAt, since(now, DAY_MS)),
      ),
    )
    .groupBy(tip.creatorId, tip.amount)
    .having(sql`count(*) >= ${RISK_THRESHOLDS.repeatedTipCount}`);

  return rows.map(({ creatorId, ...evidence }) => ({
    rule: "repeated_tip_amount",
    creatorId,
    key: `repeated_tip_amount:${evidence.amount}`,
    rearmAfterMs: DAY_MS,
    evidence: { ...evidence, windowHours: 24 },
  }));
}

async function rapidWithdrawals(now: number): Promise<Candidate[]> {
  const total = sql<number>`sum(${payout.amount})`.mapWith(Number);
  const rows = await db
    .select({ creatorId: payout.creatorId, total, payouts: count() })
    .from(payout)
    .where(
      and(
        ne(payout.status, "failed"),
        gt(payout.createdAt, since(now, 7 * DAY_MS)),
      ),
    )
    .groupBy(payout.creatorId)
    .having(sql`count(*) >= ${RISK_THRESHOLDS.rapidWithdrawalCount}`);

  return rows.map(({ creatorId, ...evidence }) => ({
    rule: "rapid_withdrawals",
    creatorId,
    key: "rapid_withdrawals",
    rearmAfterMs: 7 * DAY_MS,
    evidence: { ...evidence, windowDays: 7 },
  }));
}

async function bankChangeBeforePayout(now: number): Promise<Candidate[]> {
  const replacedShortlyBefore = sql`exists (
    select 1 from ${auditLog}
    where ${auditLog.action} = 'bank_account.update'
      and ${auditLog.targetType} = 'creator'
      and ${auditLog.targetId} = ${payout.creatorId}::text
      and ${auditLog.createdAt} < ${payout.createdAt}
      and ${auditLog.createdAt} > ${payout.createdAt} - make_interval(hours => ${RISK_THRESHOLDS.bankChangeWindowHours})
      and jsonb_typeof(${auditLog.details} -> 'before') = 'object'
      and (
        ${auditLog.details} #>> '{before,accountNumberLast4}',
        ${auditLog.details} #>> '{before,bankName}'
      ) is distinct from (
        ${auditLog.details} #>> '{after,accountNumberLast4}',
        ${auditLog.details} #>> '{after,bankName}'
      )
  )`;

  const rows = await db
    .select({
      id: payout.id,
      creatorId: payout.creatorId,
      amount: payout.amount,
      paymentReference: payout.paymentReference,
    })
    .from(payout)
    .where(
      and(
        ne(payout.status, "failed"),
        gte(payout.amount, RISK_THRESHOLDS.bankChangePayout),
        gt(payout.createdAt, since(now, 7 * DAY_MS)),
        replacedShortlyBefore,
      ),
    );

  return rows.map(({ id, creatorId, ...evidence }) => ({
    rule: "bank_change_before_payout",
    creatorId,
    key: `bank_change_before_payout:${id}`,
    evidence: {
      ...evidence,
      windowHours: RISK_THRESHOLDS.bankChangeWindowHours,
    },
  }));
}

async function verificationFailures(now: number): Promise<Candidate[]> {
  const rows = await db
    .select({ creatorId: auditLog.targetId, failures: count() })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.action, "identity.verification"),
        eq(auditLog.targetType, "creator"),
        sql`${auditLog.details} ->> 'status' = 'failed'`,
        gt(auditLog.createdAt, since(now, DAY_MS)),
      ),
    )
    .groupBy(auditLog.targetId)
    .having(sql`count(*) >= ${RISK_THRESHOLDS.verificationFailures}`);

  return rows.flatMap(({ creatorId, failures }) =>
    creatorId
      ? [
          {
            rule: "verification_failures" as const,
            creatorId,
            key: "verification_failures",
            rearmAfterMs: DAY_MS,
            evidence: { failures, windowHours: 24 },
          },
        ]
      : [],
  );
}

function linkedGroup(
  rule: "shared_payout_account" | "shared_account_name",
  creatorIds: string[],
  evidence: Record<string, unknown> = {},
): Candidate[] {
  const group = [...creatorIds].sort();
  return group.map((creatorId) => ({
    rule,
    creatorId,
    key: `${rule}:${group.join(",")}`,
    evidence: {
      ...evidence,
      linkedCreatorIds: group.filter((id) => id !== creatorId),
    },
  }));
}

async function sharedPayoutAccounts(): Promise<Candidate[]> {
  const rows = await db
    .select({
      creatorIds: sql<string[]>`array_agg(${bankAccount.creatorId}::text)`,
      bankName: sql<string>`min(${bankAccount.bankName})`,
      accountNumberLast4: sql<string>`right(${bankAccount.accountNumber}, 4)`,
    })
    .from(bankAccount)
    .groupBy(bankAccount.bankCode, bankAccount.accountNumber)
    .having(sql`count(*) > 1`);

  return rows.flatMap(({ creatorIds, ...evidence }) =>
    linkedGroup("shared_payout_account", creatorIds, evidence),
  );
}

async function sharedAccountNames(): Promise<Candidate[]> {
  const holders = db
    .select({
      creatorId: bankAccount.creatorId,
      destination:
        sql<string>`${bankAccount.bankCode} || ':' || ${bankAccount.accountNumber}`.as(
          "destination",
        ),
      holder: sql<string>`(
        select string_agg(token, ' ' order by token)
        from regexp_split_to_table(upper(${bankAccount.accountName}), '[^A-Z0-9]+') as token
        where token <> ''
      )`.as("holder"),
    })
    .from(bankAccount)
    .as("holders");

  const rows = await db
    .select({
      creatorIds: sql<string[]>`array_agg(${holders.creatorId}::text)`,
    })
    .from(holders)
    .where(sql`${holders.holder} is not null`)
    .groupBy(holders.holder)
    .having(sql`count(*) > 1 and count(distinct ${holders.destination}) > 1`);

  return rows.flatMap(({ creatorIds }) =>
    linkedGroup("shared_account_name", creatorIds),
  );
}

const RULES: Array<[RiskRule, (now: number) => Promise<Candidate[]>]> = [
  ["large_tip", largeTips],
  ["weekly_inflow", weeklyInflow],
  ["new_account_inflow", newAccountInflow],
  ["repeated_tip_amount", repeatedTipAmounts],
  ["rapid_withdrawals", rapidWithdrawals],
  ["bank_change_before_payout", bankChangeBeforePayout],
  ["verification_failures", verificationFailures],
  ["shared_payout_account", sharedPayoutAccounts],
  ["shared_account_name", sharedAccountNames],
];

async function withoutAlreadyFlagged(
  candidates: Candidate[],
  now: number,
): Promise<Candidate[]> {
  if (candidates.length === 0) return [];

  const existing = await db
    .select({
      creatorId: auditLog.targetId,
      key: sql<string | null>`${auditLog.details} ->> 'key'`,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.action, RISK_FLAG_ACTION),
        eq(auditLog.targetType, "creator"),
        inArray(auditLog.targetId, [
          ...new Set(candidates.map((candidate) => candidate.creatorId)),
        ]),
      ),
    );

  const lastFlaggedAt = new Map<string, number>();
  for (const row of existing) {
    const id = `${row.creatorId}|${row.key}`;
    const at = row.createdAt.getTime();
    if (at > (lastFlaggedAt.get(id) ?? 0)) lastFlaggedAt.set(id, at);
  }

  return candidates.filter(({ creatorId, key, rearmAfterMs }) => {
    const at = lastFlaggedAt.get(`${creatorId}|${key}`);
    if (at === undefined) return true;
    return rearmAfterMs !== undefined && now - at > rearmAfterMs;
  });
}

export async function sweepRiskFlags(): Promise<RiskSummary> {
  const summary: RiskSummary = { candidates: 0, flagged: 0, errors: 0 };
  const now = Date.now();
  const candidates: Candidate[] = [];

  for (const [rule, collect] of RULES) {
    try {
      candidates.push(...(await collect(now)));
    } catch (error) {
      summary.errors++;
      reportError(error, {
        category: "risk.monitoring",
        tags: { rule },
        fingerprint: ["risk-rule-failed", rule],
      });
    }
  }
  summary.candidates = candidates.length;

  const flagged = new Map<RiskRule, Candidate[]>();
  for (const candidate of await withoutAlreadyFlagged(candidates, now)) {
    const { rule, creatorId, key, evidence } = candidate;
    try {
      await writeAudit(db, {
        actorType: "system",
        action: RISK_FLAG_ACTION,
        targetType: "creator",
        targetId: creatorId,
        details: { rule, key, ...evidence },
      });
      flagged.set(rule, [...(flagged.get(rule) ?? []), candidate]);
      summary.flagged++;
    } catch (error) {
      summary.errors++;
      reportError(error, {
        category: "risk.monitoring",
        tags: { rule },
        extra: { creatorId },
        fingerprint: ["risk-flag-write-failed"],
      });
    }
  }

  for (const [rule, hits] of flagged) {
    reportWarning(`Risk sweep raised ${hits.length} new ${rule} flag(s)`, {
      category: "risk.monitoring",
      tags: { rule },
      extra: {
        flags: hits.map(({ creatorId, evidence }) => ({
          creatorId,
          ...evidence,
        })),
      },
      fingerprint: ["risk-flag", rule],
    });
  }

  return summary;
}
