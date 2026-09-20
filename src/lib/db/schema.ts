import {
  pgTable,
  uuid,
  text,
  bigint,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";
import type { PayoutEnvironment } from "@/lib/payout-fees";
import type { VerificationStatus } from "@/lib/identity-verification";
import { user, session } from "./auth-schema";
import type { TipPresets } from "@/types";

const tipStatus = pgEnum("tip_status", ["pending", "success", "failed"]);
const auditActorType = pgEnum("audit_actor_type", [
  "admin",
  "creator",
  "system",
]);
const adjustmentType = pgEnum("adjustment_type", [
  "refund",
  "reversal",
  "manual_credit",
  "manual_debit",
]);
const payoutStatus = pgEnum("payout_status", [
  "pending",
  "processing",
  "paid",
  "failed",
]);

const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

const creator = pgTable(
  "creator",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),
    username: text("username").notNull().unique(),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    autoPayout: boolean("auto_payout").default(true).notNull(),
    suspended: boolean("suspended").default(false).notNull(),
    payoutsFrozen: boolean("payouts_frozen").default(false).notNull(),
    frozenReason: text("frozen_reason"),
    frozenAt: timestamp("frozen_at"),
    frozenByUserId: text("frozen_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    tipPresets: jsonb("tip_presets").$type<TipPresets>(),
    allowCustomAmount: boolean("allow_custom_amount").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("creator_category_id_idx").on(t.categoryId)],
);

const abuseReport = pgTable(
  "abuse_report",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    details: text("details"),
    reporterEmail: text("reporter_email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("abuse_report_creator_id_idx").on(t.creatorId)],
);

const bankAccount = pgTable("bank_account", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .unique()
    .references(() => creator.id, { onDelete: "cascade" }),
  bankName: text("bank_name").notNull(),
  bankCode: text("bank_code").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  revision: integer("revision").default(1).notNull(),
  verificationStatus: text("verification_status")
    .$type<VerificationStatus>()
    .default("unverified")
    .notNull(),
  verificationEnvironment: text(
    "verification_environment",
  ).$type<PayoutEnvironment>(),
  verificationRevision: integer("verification_revision"),
  verifiedAt: timestamp("verified_at"),
  verificationReference: text("verification_reference"),
  verificationAttemptId: uuid("verification_attempt_id"),
  verificationConsentAt: timestamp("verification_consent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

const tip = pgTable(
  "tip",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "restrict" }),
    /** Exactly what the supporter sent and the creator earns. */
    amount: bigint("amount", { mode: "number" }).notNull(),
    amountPaid: numeric("amount_paid", {
      precision: 14,
      scale: 2,
      mode: "number",
    }),
    providerSettlementAmount: numeric("provider_settlement_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    }),
    note: text("note"),
    anonymous: boolean("anonymous").default(false).notNull(),
    tipperName: text("tipper_name"),
    tipperEmail: text("tipper_email"),
    paymentReference: text("payment_reference").notNull().unique(),
    providerReference: text("provider_reference"),
    status: tipStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("tip_creator_id_idx").on(t.creatorId),
    index("tip_status_idx").on(t.status),
  ],
);

const rateLimitCounter = pgTable(
  "rate_limit",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    windowStart: bigint("window_start", { mode: "number" }).notNull(),
  },
  (t) => [index("rate_limit_window_start_idx").on(t.windowStart)],
);

const payout = pgTable(
  "payout",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "restrict" }),
    bankAccountId: uuid("bank_account_id")
      .notNull()
      .references(() => bankAccount.id, { onDelete: "restrict" }),
    amount: numeric("amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    }).notNull(),
    creatorFeeAmount: numeric("creator_fee_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),
    actualProviderFeeAmount: numeric("actual_provider_fee_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    }),
    environment: text("environment").$type<PayoutEnvironment>(),
    feePolicyVersion: text("fee_policy_version").default("legacy").notNull(),
    destinationRevision: integer("destination_revision"),
    destinationBankName: text("destination_bank_name"),
    destinationLast4: text("destination_last4"),
    status: payoutStatus("status").default("pending").notNull(),
    paymentReference: text("payment_reference").notNull().unique(),
    providerReference: text("provider_reference"),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    paidAt: timestamp("paid_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("payout_creator_id_idx").on(t.creatorId)],
);

const adjustment = pgTable(
  "adjustment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "restrict" }),
    type: adjustmentType("type").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    reason: text("reason").notNull(),
    relatedTipId: uuid("related_tip_id").references(() => tip.id, {
      onDelete: "set null",
    }),
    relatedPayoutId: uuid("related_payout_id").references(() => payout.id, {
      onDelete: "set null",
    }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("adjustment_creator_id_idx").on(t.creatorId)],
);

const webhookEvent = pgTable(
  "webhook_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").default("monnify").notNull(),
    eventType: text("event_type"),
    signatureValid: boolean("signature_valid").notNull(),
    reference: text("reference"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    bodyHash: text("body_hash").notNull().unique(),
    receivedCount: integer("received_count").default(1).notNull(),
    processingOutcome: text("processing_outcome"),
    processingError: text("processing_error"),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (t) => [
    index("webhook_event_reference_idx").on(t.reference),
    index("webhook_event_received_at_idx").on(t.receivedAt),
  ],
);

const auditLog = pgTable(
  "audit_log",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    actorType: auditActorType("actor_type").notNull(),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    details: jsonb("details").$type<Record<string, unknown>>(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("audit_log_created_at_idx").on(t.createdAt),
    index("audit_log_actor_user_id_idx").on(t.actorUserId),
    index("audit_log_target_idx").on(t.targetType, t.targetId),
  ],
);

const adminMfaVerification = pgTable("admin_mfa_verification", {
  sessionId: text("session_id")
    .primaryKey()
    .references(() => session.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
});

export {
  tipStatus,
  payoutStatus,
  auditActorType,
  category,
  creator,
  abuseReport,
  bankAccount,
  tip,
  payout,
  rateLimitCounter,
  webhookEvent,
  auditLog,
  adminMfaVerification,
  adjustmentType,
  adjustment,
};
