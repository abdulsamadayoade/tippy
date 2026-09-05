ALTER TABLE "tip" ADD COLUMN "platform_fee_bps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tip" ADD COLUMN "platform_fee_amount" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tip" ADD COLUMN "net_amount" bigint GENERATED ALWAYS AS ("amount" - "platform_fee_amount") STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "tip" ADD COLUMN "amount_paid" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "tip" ADD COLUMN "provider_settlement_amount" numeric(14, 2);--> statement-breakpoint
-- Hand-appended, following 0010_dusty_cammi.sql. The generated net_amount
-- column already guarantees net + fee = amount; this covers what it can't, so
-- a negative net or an out-of-range rate is structurally impossible.
ALTER TABLE "tip" ADD CONSTRAINT "tip_platform_fee_bounds_check" CHECK (
  "platform_fee_amount" >= 0
  AND "platform_fee_amount" <= "amount"
  AND "platform_fee_bps" >= 0
  AND "platform_fee_bps" <= 10000
);
