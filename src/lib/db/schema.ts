import {
  pgTable,
  uuid,
  text,
  bigint,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

const tipStatus = pgEnum("tip_status", ["pending", "success", "failed"]);
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("creator_category_id_idx").on(t.categoryId)],
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
      .references(() => creator.id, { onDelete: "cascade" }),
    amount: bigint("amount", { mode: "number" }).notNull(),
    note: text("note"),
    anonymous: boolean("anonymous").default(false).notNull(),
    tipperName: text("tipper_name"),
    tipperEmail: text("tipper_email"),
    paymentReference: text("payment_reference").notNull().unique(),
    providerReference: text("provider_reference"),
    status: tipStatus("status").default("pending").notNull(),
    payoutId: uuid("payout_id").references(() => payout.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("tip_creator_id_idx").on(t.creatorId),
    index("tip_payout_id_idx").on(t.payoutId),
    index("tip_status_idx").on(t.status),
  ],
);

const payout = pgTable(
  "payout",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    bankAccountId: uuid("bank_account_id")
      .notNull()
      .references(() => bankAccount.id, { onDelete: "restrict" }),
    amount: bigint("amount", { mode: "number" }).notNull(),
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

export { tipStatus, payoutStatus, category, creator, bankAccount, tip, payout };
